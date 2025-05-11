import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type OTPDocument = OTP & Document;

export enum OTPStatus {
  ACTIVE = "active",
  USED = "used",
  EXPIRED = "expired",
  VERIFIED = "verified",
}

@Schema({ timestamps: true })
export class OTP {
  @Prop({ required: true })
  cell_number: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ enum: OTPStatus, default: OTPStatus.ACTIVE })
  status: OTPStatus;

  @Prop({ required: true })
  expires_at: Date;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);
