import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    example: "+12345678901",
    description: "User cell number in E.164 format",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{10,15}$/, {
    message: "Cell number must be in E.164 format, e.g., +12345678901",
  })
  cell_number: string;
}
