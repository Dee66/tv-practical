import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../user/user.schema";
import { OTP, OTPDocument, OTPStatus } from "./otp.schema";
import { WebSocketGatewayService } from "src/websocket/websocket.gateway";

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(OTP.name) private readonly otpModel: Model<any>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => WebSocketGatewayService))
    private readonly webSocketGateway: WebSocketGatewayService,
  ) {}

  private readonly logger = new Logger(OtpService.name);

  /**
   * Validates an OTP for a phone number.
   * Returns the OTP document if valid and active, or null otherwise.
   */
  async validateOtp(
    cellNumber: string,
    otp: string,
  ): Promise<OTPDocument | null> {
    return this.otpModel.findOne({
      cell_number: cellNumber,
      otp,
      status: OTPStatus.ACTIVE,
      expires_at: { $gt: new Date() },
    });
  }

  /**
   * Marks the given OTP document as USED.
   */
  async markAsUsed(otpDoc: OTPDocument): Promise<void> {
    otpDoc.status = OTPStatus.USED;
    await otpDoc.save();
  }

  // Verify cell number, create user if does not exist
  async verifyCellNumber(cellNumber: string) {
    // Find user
    const user = await this.userModel.findOne({ cell_number: cellNumber });

    // If a user does not exist, create
    // todo DP --> spec is unclear, create if not exist?
    if (!user) {
      await this.userModel.create({ cell_number: cellNumber });
    }

    return { success: true };
  }

  createOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Generate and store/send the OTP
  async generateOtp(cellNumber: string) {
    const otp = this.createOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Expire any previous active OTPs for this number
    await this.otpModel.updateOne(
      { cell_number: cellNumber, status: OTPStatus.ACTIVE },
      { $set: { status: OTPStatus.EXPIRED } },
    );

    await this.otpModel.create({
      cell_number: cellNumber,
      status: OTPStatus.ACTIVE,
      expires_at: expiresAt,
    });

    this.webSocketGateway.emitOtpResponse(cellNumber, otp);

    return {
      success: true,
    };
  }

  calculateExpiry(minutes: number): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
