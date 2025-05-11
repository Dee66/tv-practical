import { PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsOptional, IsString, Matches } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @Matches(/^\+\d{10,15}$/, {
    message: "cell_number must be in E.164 format, e.g., +12345678901",
  })
  cell_number?: string;
}
