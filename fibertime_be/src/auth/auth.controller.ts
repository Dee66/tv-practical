/**
 * AuthController
 *
 * This controller handles all authentication-related operations, including requesting OTPs, logging in,
 * and checking the authentication status of a user.
 */
import { Body, Controller, Post, Logger, BadGatewayException } from "@nestjs/common";
import { UserService } from "../user/user.service";
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
  async requestOtp(@Body("cellNumber") cellNumber: string) {
    const user = await this.userService.findOrCreateClient(cellNumber);
    if (!user) {
      throw new BadGatewayException({
        success: false,
        message: "Something has gone horribly wrong, please try again",
      });
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
  async login(@Body() dto: LoginDto) {
    await this.otpService.validateOtp(dto.cellNumber, dto.otp);
    return this.authService.login(dto.cellNumber);
  }
}
