import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ErrorCodes } from "../common/constants/error-codes";
import {
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
} from "./subscriptions.schema";

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async create(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const created = new this.subscriptionModel(subscriptionData);
    return created.save();
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    const subs = await this.subscriptionModel
      .find({ user: new Types.ObjectId(userId) })
      .exec();
    if (!subs || subs.length === 0) {
      throw new NotFoundException({
        errorCode: ErrorCodes.NOT_FOUND,
        message: `No subscriptions found for user ${userId}`,
      });
    }
    return subs;
  }

  async getUserActiveBalance(userId: string): Promise<number | null> {
    const activeSubscription = await this.subscriptionModel.findOne({
      user: new Types.ObjectId(userId),
      status: SubscriptionStatus.ACTIVE,
    });
    if (!activeSubscription) {
      throw new NotFoundException({
        errorCode: ErrorCodes.NOT_FOUND,
        message: `No active subscription found for user ${userId}`,
      });
    }
    return activeSubscription.dataBalance;
  }
}
