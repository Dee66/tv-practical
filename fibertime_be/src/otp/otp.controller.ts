/**
 * OtpController
 *
 * This controller handles all operations related to OTP (One-Time Password) management, including
 * verifying phone numbers and validating OTPs for authentication purposes.
 */
import { Body, Controller, Logger, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response as ExpressResponse } from "express";
import { AuthService } from "../auth/auth.service";
import { LoginDto } from "../auth/dto/login.dto";
import { GenerateOtpDto } from "./dto/generate-otp.dto";
import { OtpService } from "./otp.service";

@ApiTags("otp")
@Controller("otp")
export class OtpController {
  private readonly logger = new Logger(OtpController.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly authService: AuthService,
  ) { }

  /**
   * POST /otp/verify-phone
   *
   * Endpoint to verify a user's phone number and generate an OTP.
   *
   * @param dto - The data transfer object containing the user's phone number.
   * @returns A response indicating whether the phone number was verified and the OTP was sent.
   */
  @Post("verify-phone")
  async verifyCellNumber(@Body() dto: GenerateOtpDto) {
    // Step 1: Verify (and possibly create) the user
    const verification = await this.otpService.verifyCellNumber(dto.cellNumber);
    if (!verification.success) {
      this.logger.error(`Verification FAILED for ${dto.cellNumber}`);
      return { success: false, message: "Unable to verify phone number" };
    }

    // Step 2: Generate OTP
    return await this.otpService.generateOtp(dto.cellNumber);
  }

  /**
   * POST /otp/verify-otp
   *
   * Endpoint to verify an OTP and log in the user.
   *
   * @param dto - The data transfer object containing the user's login credentials (phone number and OTP).
   * @param res - The Express response object used to send the response.
   * @returns A JWT token if the OTP is valid, or an error message if it fails.
   */

  // DP --> leaving this endpoint as the spec is unclear on login:
  // POST /api/auth/login → Validates the client’s cell number with the OTP.
  // User enters OTP → POST /verify-otp authenticates them.
  // so which is it? The login route makes more sense to me. Leaving the code
  @Post("verify-otp")
  async verifyOtp(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    try {
      await this.otpService.validateOtp(dto.cellNumber, dto.otp);
      return await this.authService.login(dto.cellNumber);
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}
