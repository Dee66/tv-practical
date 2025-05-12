import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

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
import { ErrorCodes, ErrorCodeMessages } from "../common/constants/error-codes";

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

  // Validate input
  // Expire all previous active OTPs
  // Generate a new OTP value and calculates its expiry time
  // Insert the new OTP as "active" into the database
  async requestOtp(dto: RequestOtpDto) {
    const { cellNumber } = dto;
    if (!cellNumber) {
      throw new BadRequestException({
        errorCode: ErrorCodes.VALIDATION_ERROR,
        message: "Cell number is required",
      });
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
      throw new HttpException(
        {
          errorCode: ErrorCodes.INTERNAL_ERROR,
          message: ErrorCodeMessages[ErrorCodes.INTERNAL_ERROR],
          details: error?.message || error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      success: true,
      otp,
    };
  }

  async login(cellNumber: string) {
    try {
      // 1. Lookup user
      const user = await this.userService.findOrCreateClient(cellNumber);
      if (!user) {
        throw new UnauthorizedException({
          errorCode: ErrorCodes.USER_NOT_FOUND,
          message: ErrorCodeMessages[ErrorCodes.USER_NOT_FOUND],
        });
      }

      // 2. Generate token
      const accessToken = this.generateAccessToken(
        String(user._id),
        cellNumber,
      );

      // 3. Get user primary device, if possible
      const device = await this.deviceService.getUserDevice(user._id);
      const deviceCode = device ? device.pairingCode : null;

      // 4. Return successful login response
      return {
        success: true,
        accessToken,
        deviceCode,
        user: {
          id: String(user._id),
          cell_number: cellNumber,
        },
      };
    } catch (err) {
      this.logger.error("Login error:", err);
      throw new UnauthorizedException({
        errorCode: ErrorCodes.UNAUTHORIZED,
        message: ErrorCodeMessages[ErrorCodes.UNAUTHORIZED],
        details: err?.message || err,
      });
    }
  }
}
