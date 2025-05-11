import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RequestOtpDto } from "./dto/request-otp.dto";
import { LoginDto } from "./dto/login.dto";
import { Response as ExpressResponse } from "express";

describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    requestOtp: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("requestOtp", () => {
    it("should call AuthService.requestOtp and return the result", async () => {
      const dto: RequestOtpDto = { cellNumber: "1234567890" };
      const result = { success: true };
      mockAuthService.requestOtp.mockResolvedValue(result);

      expect(await controller.requestOtp(dto)).toBe(result);
      expect(mockAuthService.requestOtp).toHaveBeenCalledWith(dto);
    });
  });

  describe("login", () => {
    it("should call AuthService.login and return the result", async () => {
      const dto: LoginDto = { cellNumber: "1234567890", otp: "123456" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as ExpressResponse;
      const result = { accessToken: "jwt-token" };
      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(dto, res)).toBe(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });

    it("should handle errors and return a 500 response", async () => {
      const dto: LoginDto = { cellNumber: "1234567890", otp: "123456" };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as ExpressResponse;
      mockAuthService.login.mockRejectedValue(new Error("Login failed"));

      await controller.login(dto, res);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error",
      });
    });
  });
});
