import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Document } from "mongoose";
import { Bundle } from "../bundle/bundle.schema";
import { User } from "../user/user.schema"; 

export type DeviceDocument = Device & Document;

export enum DeviceStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  CONNECTED = "connected",
  PAIRED = "paired",
}

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true })
  mac_address: string;

  @Prop({ required: true, unique: true })
  pairingCode: string;

  @Prop({ enum: DeviceStatus, default: DeviceStatus.ACTIVE })
  status: DeviceStatus;

  @Prop({ required: true })
  expires_at: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bundle",
    required: false,
  })
  bundle?: mongoose.Types.ObjectId | Bundle;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  })
  owner?: mongoose.Types.ObjectId | User; 
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// TTL index: MongoDB will auto-remove expired codes after 'expires_at'
DeviceSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
DeviceSchema.index({ pairingCode: 1 }, { unique: true });
