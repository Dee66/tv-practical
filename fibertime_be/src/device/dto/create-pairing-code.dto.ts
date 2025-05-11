import { IsString } from "class-validator";

export class CreatePairingCodeDto {
  @IsString()
  mac_address: string;
}
