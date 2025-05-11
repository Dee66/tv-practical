import { IsNotEmpty, IsString } from "class-validator";
import { IsE164Phone } from "./phone.validator";

export class GenerateOtpDto {
  @IsString()
  @IsNotEmpty()
  @IsE164Phone({
    message:
      "Cell number must be valid and in E.164 format (e.g. +12345678901)",
  })
  cellNumber: string;
}
