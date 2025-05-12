import { Subscription } from "../subscriptions.schema";

export class SubscriptionResponseDto {
  _id: string;
  user: string;
  bundle: string;
  dataBalance: number;
  status: string;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    sub: Partial<Subscription> & {
      _id?: any;
      user?: any;
      bundle?: any;
      createdAt?: Date;
      updatedAt?: Date;
    },
  ) {
    this._id = sub._id?.toString?.() ?? '';
    this.user = sub.user?.toString?.() ?? '';
    this.bundle = sub.bundle?.toString?.() ?? '';
    this.dataBalance = sub.dataBalance ?? 0;
    this.status = sub.status ?? '';
    this.startDate = sub.startDate;
    this.endDate = sub.endDate;
    this.createdAt = sub.createdAt;
    this.updatedAt = sub.updatedAt;
  }
}