import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
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
    return this.subscriptionModel
      .find({ user: new Types.ObjectId(userId) })
      .exec();
  }

  async getUserActiveBalance(userId: string): Promise<number | null> {
    const activeSubscription = await this.subscriptionModel.findOne({
      user: new Types.ObjectId(userId),
      status: SubscriptionStatus.ACTIVE,
    });
    return activeSubscription ? activeSubscription.dataBalance : null;
  }
}
