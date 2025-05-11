import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type BundleDocument = Bundle & Document;

@Schema({ timestamps: true })
export class Bundle {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  duration_days: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  subscriptionData: number;
}

export const BundleSchema = SchemaFactory.createForClass(Bundle);
