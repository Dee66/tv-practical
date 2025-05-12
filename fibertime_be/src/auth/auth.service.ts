import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  HttpStatus,
} from "@nestjs/common";
import { throwAppException } from "../common/utils/throw-exception.util";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { WebSocketGatewayService } from "../websocket/websocket.gateway";
import { DeviceService } from "../device/device.service";
import { OTP, OTPDocument, OTPStatus } from "../otp/otp.schema";
import { OtpService } from "../otp/otp.service";
import { UserService } from "../user/user.service";
import { RequestOtpDto } from "./dto/request-otp.dto";
import { User, UserDocument } from "../user/user.schema";
import { ErrorCodes } from "../common/constants/error-codes";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(OTP.name) private otpModel: Model<OTPDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly otpService: OtpService,
    @Inject(forwardRef(() => DeviceService))
    private readonly deviceService: DeviceService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => WebSocketGatewayService))
    private readonly webSocketGateway: WebSocketGatewayService,
  ) {}

  private generateAccessToken(userId: string, cellNumber: string): string {
    const payload = {
      sub: userId,
      cellNumber,
    };
    return this.jwtService.sign(payload);
  }

  async requestOtp(dto: RequestOtpDto) {
    const { cellNumber } = dto;
    if (!cellNumber) {
      throwAppException(ErrorCodes.VALIDATION_ERROR, "Cell number is required");
    }
    await this.otpModel.updateMany(
      { cell_number: cellNumber, status: OTPStatus.ACTIVE },
      { $set: { status: OTPStatus.EXPIRED } },
    );

    const otp = this.otpService.createOtp();
    const expiresAt = this.otpService.calculateExpiry(5);

    try {
      await this.otpModel.create({
        cell_number: cellNumber,
        otp,
        status: OTPStatus.ACTIVE,
        expires_at: expiresAt,
      });
      this.webSocketGateway.emitOtpResponse(cellNumber, otp);
    } catch (error) {
      this.logger.error("Error creating OTP:", error);
      throwAppException(
        ErrorCodes.INTERNAL_ERROR,
        error?.message || error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      success: true,
      otp,
    };
  }

  async login(cellNumber: string) {
    const user = await this.userService.findOrCreateClient(cellNumber);
    if (!user) {
      throwAppException(ErrorCodes.USER_NOT_FOUND);
    }

    const accessToken = this.generateAccessToken(String(user._id), cellNumber);
    const device = await this.deviceService.getUserDevice(user._id);
    const deviceCode = device ? device.pairingCode : null;

    return {
      success: true,
      accessToken,
      deviceCode,
      user: {
        id: String(user._id),
        cell_number: cellNumber,
      },
    };
  }
}
