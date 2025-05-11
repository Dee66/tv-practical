import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Device } from "src/device/device.schema";
import { Bundle } from "../bundle/bundle.schema";

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  cell_number: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Device" }], default: [] })
  devices: (Types.ObjectId | Device)[];

  @Prop({ type: Types.ObjectId, ref: "Bundle", default: null })
  bundle: Types.ObjectId | Bundle | null;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
