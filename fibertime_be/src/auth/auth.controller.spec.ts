import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OtpService } from "../otp/otp.service";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";

describe("AuthController", () => {
  let controller: AuthController;
  let mockAuthService: any;
  let mockOtpService: any;
  let mockUserService: any;
  let mockRes: any;

  beforeEach(async () => {
    mockAuthService = { login: jest.fn() };
    mockOtpService = { requestOtp: jest.fn(), validateOtp: jest.fn() };
    mockUserService = { findOrCreateClient: jest.fn() };

    mockRes = {
      cookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe("login", () => {
    it("should login a user and set a cookie", async () => {
      const dto: LoginDto = { cellNumber: "1234567890", otp: "1234" };
      const result = { accessToken: "token" };
      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(dto, mockRes)).toBe(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.cellNumber);
    });
  });

  describe("requestOtp", () => {
    it("should request an OTP for a cell number", async () => {
      const dto = { cellNumber: "1234567890" };
      const result = { success: true };
      mockUserService.findOrCreateClient.mockResolvedValue({}); // Simulate user found
      mockAuthService.requestOtp = jest.fn().mockResolvedValue(result);

      const cellNumber = "1234567890";
      expect(await controller.requestOtp(cellNumber, mockRes)).toBe(result);
      expect(mockAuthService.requestOtp).toHaveBeenCalledWith({ cellNumber });
    });
  });
});



