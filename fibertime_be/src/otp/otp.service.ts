import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ErrorCodes } from "../common/constants/error-codes";
import { throwAppException } from "../common/utils/throw-exception.util";
import { User, UserDocument } from "../user/user.schema";
import { WebSocketGatewayService } from "../websocket/websocket.gateway";
import { OTP, OTPDocument, OTPStatus } from "./otp.schema";

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(OTP.name) private readonly otpModel: Model<any>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(forwardRef(() => WebSocketGatewayService))
    private readonly webSocketGateway: WebSocketGatewayService,
  ) {}

  /**
   * Validates an OTP for a phone number.
   * Returns the OTP document if valid and active, or throws if not.
   */
  async validateOtp(cellNumber: string, otp: string): Promise<OTPDocument> {
    const otpDoc = await this.otpModel.findOne({
      cell_number: cellNumber,
      otp,
      status: OTPStatus.ACTIVE,
      expires_at: { $gt: new Date() },
    });

    if (!otpDoc) {
      throwAppException(ErrorCodes.OTP_INVALID);
    }

    return otpDoc;
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
    if (!cellNumber) {
      throwAppException(
        ErrorCodes.VALIDATION_ERROR,
        "Cell number is required.",
      );
    }
    let user = await this.userModel.findOne({ cell_number: cellNumber });
    if (!user) {
      try {
        user = await this.userModel.create({ cell_number: cellNumber });
      } catch (error) {
        throwAppException(ErrorCodes.INTERNAL_ERROR, error?.message || error);
      }
    }

    return { success: true };
  }

  createOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Generate and store/send the OTP
  async generateOtp(cellNumber: string) {
    if (!cellNumber) {
      throwAppException(
        ErrorCodes.VALIDATION_ERROR,
        "Cell number is required.",
      );
    }
    const otp = this.createOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
      // Expire any previous active OTPs for this number
      await this.otpModel.updateOne(
        { cell_number: cellNumber, status: OTPStatus.ACTIVE },
        { $set: { status: OTPStatus.EXPIRED } },
      );

      await this.otpModel.create({
        cell_number: cellNumber,
        otp,
        status: OTPStatus.ACTIVE,
        expires_at: expiresAt,
      });

      this.webSocketGateway.emitOtpResponse(cellNumber, otp);
    } catch (error) {
      throwAppException(ErrorCodes.INTERNAL_ERROR, error?.message || error);
    }

    return {
      success: true,
      otp,
    };
  }

  calculateExpiry(minutes: number): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
