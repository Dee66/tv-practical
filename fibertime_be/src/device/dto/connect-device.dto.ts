import { IsMongoId, IsString } from "class-validator";

export class ConnectDeviceDto {
  @IsString({ message: "deviceId must be a valid MongoDB ObjectId" })
  deviceId: string;
  @IsMongoId({ message: "bundleId must be a valid MongoDB ObjectId" })
  bundleId: string;
}
