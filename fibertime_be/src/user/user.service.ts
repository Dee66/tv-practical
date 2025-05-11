import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Bundle } from "../bundle/bundle.schema";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserDocument } from "./user.schema";
import {
  Subscription,
  SubscriptionStatus,
} from "../subscriptions/subscriptions.schema";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findByCellNumber(cell_number: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ cell_number }).exec();
    return user || null;
  }

  async findOneWithBundle(userId: string): Promise<UserDocument | null> {
    const user = await this.userModel
      .findById(userId)
      .populate("bundle")
      .exec();
    return user || null;
  }

  async create(cellNumber: string): Promise<UserDocument> {
    try {
      return new this.userModel({ cell_number: cellNumber }).save();
    } catch (error) {
      this.logger.error(`Error creating user: ${error}`);
      throw new Error("Error creating user");
    }
  }

  async findOrCreateClient(cellNumber: string): Promise<UserDocument> {
    let user = await this.findByCellNumber(cellNumber);
    if (!user) {
      user = await this.create(cellNumber);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }
    return updatedUser;
  }

  async getUserBundle(userId: string): Promise<Bundle | null> {
    if (!userId) {
      throw new NotFoundException("No user in request");
    }
    const user = await this.userModel
      .findById(userId)
      .populate("bundle")
      .exec();
    return (user?.bundle as Bundle) || null;
  }

  async getUserDataBalance(userId: string): Promise<number | null> {
    if (!userId) {
      throw new NotFoundException("No user in request");
    }
    const subscription = await this.subscriptionModel
      .findOne({
        user: userId,
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();
    return subscription ? subscription.dataBalance : null;
  }
}
