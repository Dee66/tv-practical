import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateBundleDto {
  @ApiProperty({ example: "Super Saver", description: "Name of the bundle" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "A data bundle with 30 days validity",
    description: "Description of the bundle",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 30, description: "Bundle duration in days" })
  @IsNumber()
  @Min(1)
  duration_days: number;

  @ApiProperty({
    example: 1000,
    description:
      "Price of the bundle in the smallest currency unit (e.g., cents)",
  })
  @IsNumber()
  @Min(0)
  price: number;
}
