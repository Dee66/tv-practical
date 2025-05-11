import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../user/user.schema";
import { Bundle } from "../bundle/bundle.schema";

export type SubscriptionDocument = Subscription & Document;

export enum SubscriptionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  SUSPENDED = "suspended",
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  user: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: "Bundle", required: true })
  bundle: Types.ObjectId | Bundle;

  @Prop({ required: true })
  dataBalance: number; // in MB or GB

  @Prop({ enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);