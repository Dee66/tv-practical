import { IsString, Length } from "class-validator";

export class LoginDto {
  @IsString()
  cellNumber: string;

  @IsString()
  @Length(6, 6, { message: "otp must be a 6-digit code" })
  otp: string;
}
