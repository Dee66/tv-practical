/**
 * AuthController
 *
 * This controller handles all authentication-related operations, including requesting OTPs, logging in,
 * and checking the authentication status of a user.
 */
import { Body, Controller, Post, Res, Logger } from "@nestjs/common";
import { Response as ExpressResponse } from "express";
import { UserService } from "src/user/user.service";
import { OtpService } from "../otp/otp.service";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly userService: UserService,
  ) {}

  private readonly logger = new Logger(AuthController.name);

  /**
   * POST /auth/request-otp
   *
   * Endpoint to request a One-Time Password (OTP) for authentication.
   *
   * @param dto - The data transfer object containing the user's phone number or identifier.
   * @returns A response indicating whether the OTP was successfully sent.
   */
  @Post("request-otp")
  async requestOtp(
    @Body("cellNumber") cellNumber: string,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const user = await this.userService.findOrCreateClient(cellNumber);
    if (!user) {
      // todo dp -> confirm http code for shit went wrong
      // maybe change exception handling to enum? investigate
      res.status(502).json({
        success: false,
        message: "Something has gone horribly wrong, please try again",
      });
      return;
    }
    return this.authService.requestOtp({ cellNumber });
  }

  /**
   * POST /auth/login
   *
   * Endpoint to log in a user using their credentials.
   *
   * @param dto - The data transfer object containing the user's login credentials (e.g., phone number and OTP).
   * @param res - The Express response object used to send the response.
   * @returns A JWT token if the login is successful, or an error message if it fails.
   */
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    try {
      await this.otpService.validateOtp(dto.cellNumber, dto.otp);
      return await this.authService.login(dto.cellNumber);
    } catch (err) {
      this.logger.error("Login error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}
