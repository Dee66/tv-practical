/**
 * OtpController
 *
 * This controller handles all operations related to OTP (One-Time Password) management, including
 * verifying phone numbers and validating OTPs for authentication purposes.
 */
import { Body, Controller, Logger, Post, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
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
  ) {}

  @ApiOperation({ summary: "Verify a user's phone number and generate an OTP" })
  @ApiBody({
    schema: {
      example: {
        cellNumber: "+27123456789",
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "OTP generated and sent to the user",
    schema: {
      example: {
        success: true,
        message: "OTP sent successfully",
        otp: "123456",
      },
    },
  })
  @Post("verify-phone")
  async verifyCellNumber(@Body() dto: GenerateOtpDto) {
    const verification = await this.otpService.verifyCellNumber(dto.cellNumber);
    if (!verification.success) {
      this.logger.error(`Verification FAILED for ${dto.cellNumber}`);
      return { success: false, message: "Unable to verify phone number" };
    }
    return await this.otpService.generateOtp(dto.cellNumber);
  }

  @ApiOperation({ summary: "Verify an OTP and log in the user" })
  @ApiBody({
    schema: {
      example: {
        cellNumber: "+27123456789",
        otp: "123456",
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "JWT token if the OTP is valid",
    schema: {
      example: {
        accessToken: "jwt.token.here",
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Server error or invalid OTP",
    schema: {
      example: {
        success: false,
        message: "Server error",
      },
    },
  })
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
