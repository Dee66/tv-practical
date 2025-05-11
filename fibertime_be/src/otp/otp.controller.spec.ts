import { Test, TestingModule } from "@nestjs/testing";
import { OtpController } from "./otp.controller";
import { OtpService } from "./otp.service";
import { AuthService } from "../auth/auth.service";
import { GenerateOtpDto } from "./dto/generate-otp.dto";

describe("OtpController", () => {
  let controller: OtpController;
  let otpService: OtpService;
  let authService: AuthService;

  const mockOtpService = {
    verifyCellNumber: jest.fn(),
    generateOtp: jest.fn(),
  };

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks(); // Reset mock state before each test

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<OtpController>(OtpController);
    otpService = module.get<OtpService>(OtpService);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("verifyCellNumber", () => {
    it("should verify a cell number and generate an OTP", async () => {
      const dto: GenerateOtpDto = { cellNumber: "1234567890" };
      const verificationResult = { success: true };
      const otpResult = { otp: "123456", expires_at: new Date() };

      mockOtpService.verifyCellNumber.mockResolvedValue(verificationResult);
      mockOtpService.generateOtp.mockResolvedValue(otpResult);

      const result = await controller.verifyCellNumber(dto);

      expect(result).toEqual(otpResult);
      expect(mockOtpService.verifyCellNumber).toHaveBeenCalledWith(
        dto.cellNumber,
      );
      expect(mockOtpService.generateOtp).toHaveBeenCalledWith(dto.cellNumber);
    });

    it("should return an error if verification fails", async () => {
      const dto: GenerateOtpDto = { cellNumber: "1234567890" };
      const verificationResult = { success: false };

      mockOtpService.verifyCellNumber.mockResolvedValue(verificationResult);

      const result = await controller.verifyCellNumber(dto);

      expect(result).toEqual({
        success: false,
        message: "Invalid phone number",
      });
      expect(mockOtpService.verifyCellNumber).toHaveBeenCalledWith(
        dto.cellNumber,
      );
      expect(mockOtpService.generateOtp).not.toHaveBeenCalled();
    });
  });
});
