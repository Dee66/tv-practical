import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ErrorCodes } from "../common/constants/error-codes";
import { throwAppException } from "../common/utils/throw-exception.util";
import { SubscriptionResponseDto } from "./dto/subscription-response.dto";
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
  ) { }

  async create(
    subscriptionData: Partial<Subscription>,
  ): Promise<SubscriptionResponseDto> {
    const created = new this.subscriptionModel(subscriptionData);
    const saved = await created.save();
    return new SubscriptionResponseDto(saved);
  }

  async findByUser(userId: string): Promise<SubscriptionResponseDto[]> {
    const subs = await this.subscriptionModel
      .find({ user: new Types.ObjectId(userId) })
      .exec();
    if (!subs || subs.length === 0) {
      throwAppException(
        ErrorCodes.NOT_FOUND,
        `No subscriptions found for user ${userId}`,
      );
    }
    return subs.map((sub) => new SubscriptionResponseDto(sub));
  }

  async getUserActiveBalance(userId: string): Promise<number | null> {
    const activeSubscription = await this.subscriptionModel.findOne({
      user: new Types.ObjectId(userId),
      status: SubscriptionStatus.ACTIVE,
    });
    if (!activeSubscription) {
      throwAppException(
        ErrorCodes.NOT_FOUND,
        `No active subscription found for user ${userId}`,
      );
    }
    return activeSubscription.dataBalance;
  }
}
