import { PartialType } from "@nestjs/swagger";
import { CreateBundleDto } from "./create-bundle.dto";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateBundleDto extends PartialType(CreateBundleDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_days?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
