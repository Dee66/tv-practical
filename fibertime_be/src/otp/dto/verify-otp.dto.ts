import { IsNotEmpty, IsString, Matches } from "class-validator";

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{10,15}$/, {
    message: "Cell number must be in E.164 format, e.g., +12345678901",
  })
  cellNumber: string;

  @IsString()
  @IsNotEmpty()
  // OTPs are usually 4-8 digit codes depending on your system; adjust regex as needed.
  @Matches(/^\d{4,8}$/, {
    message: "otp must be a numeric string (4-8 digits)",
  })
  otp: string;
}
