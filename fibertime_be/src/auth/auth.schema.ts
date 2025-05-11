import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AuthSessionDocument = AuthSession & Document;

@Schema({ timestamps: true })
export class AuthSession {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
