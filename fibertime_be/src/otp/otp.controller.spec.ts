import { Test, TestingModule } from "@nestjs/testing";
import { OtpController } from "./otp.controller";
import { OtpService } from "./otp.service";
import { AuthService } from "../auth/auth.service";
import { Response as ExpressResponse } from "express";

describe("OtpController", () => {
  let controller: OtpController;
  let mockOtpService: any;
  let mockAuthService: any;
  let mockRes: any;

  beforeEach(async () => {
    mockOtpService = {
      verifyCellNumber: jest.fn(),
      generateOtp: jest.fn(),
      validateOtp: jest.fn(),
    };
    mockAuthService = {
      login: jest.fn(),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        { provide: OtpService, useValue: mockOtpService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<OtpController>(OtpController);
  });

  describe("verifyCellNumber", () => {
    it("should verify the cell number and generate an OTP", async () => {
      const dto = { cellNumber: "1234567890" };
      mockOtpService.verifyCellNumber.mockResolvedValue({ success: true });
      mockOtpService.generateOtp.mockResolvedValue({ success: true });

      const result = await controller.verifyCellNumber(dto);

      expect(mockOtpService.verifyCellNumber).toHaveBeenCalledWith(dto.cellNumber);
      expect(mockOtpService.generateOtp).toHaveBeenCalledWith(dto.cellNumber);
      expect(result).toEqual({ success: true });
    });

    it("should return failure if verification fails", async () => {
      const dto = { cellNumber: "1234567890" };
      mockOtpService.verifyCellNumber.mockResolvedValue({ success: false });

      const result = await controller.verifyCellNumber(dto);

      expect(mockOtpService.verifyCellNumber).toHaveBeenCalledWith(dto.cellNumber);
      expect(result).toEqual({ success: false, message: "Unable to verify phone number" });
    });
  });

  describe("verifyOtp", () => {
    it("should validate the OTP and login the user", async () => {
      const dto = { cellNumber: "1234567890", otp: "1234" };
      const loginResult = { token: "jwt" };
      mockOtpService.validateOtp.mockResolvedValue(true);
      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.verifyOtp(dto, mockRes);

      expect(mockOtpService.validateOtp).toHaveBeenCalledWith(dto.cellNumber, dto.otp);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.cellNumber);
      expect(result).toBe(loginResult);
    });

    it("should return error if OTP validation throws", async () => {
      const dto = { cellNumber: "1234567890", otp: "1234" };
      mockOtpService.validateOtp.mockRejectedValue(new Error("fail"));

      const result = await controller.verifyOtp(dto, mockRes);

      expect(mockOtpService.validateOtp).toHaveBeenCalledWith(dto.cellNumber, dto.otp);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Server error" });
      expect(result).toBeUndefined();
    });
  });
});