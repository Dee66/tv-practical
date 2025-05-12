import {
  Injectable,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Bundle } from "../bundle/bundle.schema";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserDocument } from "./user.schema";
import {
  Subscription,
  SubscriptionStatus,
} from "../subscriptions/subscriptions.schema";
import { ErrorCodes } from "../common/constants/error-codes";
import { UserResponseDto } from "./dto/user-response.dto";
import { throwAppException } from "../common/utils/throw-exception.util";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throwAppException(ErrorCodes.USER_NOT_FOUND);
    }
    return new UserResponseDto(user);
  }

  async findByCellNumber(cell_number: string): Promise<UserResponseDto | null> {
    const user = await this.userModel.findOne({ cell_number }).exec();
    return user ? new UserResponseDto(user) : null;
  }

  async findOneWithBundle(userId: string): Promise<UserResponseDto | null> {
    const user = await this.userModel
      .findById(userId)
      .populate("bundle")
      .exec();
    return user ? new UserResponseDto(user) : null;
  }

  async create(cellNumber: string): Promise<UserResponseDto> {
    try {
      const user = await new this.userModel({ cell_number: cellNumber }).save();
      return new UserResponseDto(user);
    } catch (error) {
      this.logger.error(`Error creating user: ${error}`);
      throwAppException(ErrorCodes.INTERNAL_ERROR, error?.message || error);
    }
  }

  async findOrCreateClient(cellNumber: string): Promise<UserResponseDto> {
    let user = await this.findByCellNumber(cellNumber);
    if (!user) {
      user = await this.create(cellNumber);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throwAppException(ErrorCodes.USER_NOT_FOUND);
    }
    return new UserResponseDto(updatedUser);
  }

  async getUserBundle(userId: string): Promise<Bundle | null> {
    if (!userId) {
      throwAppException(ErrorCodes.USER_NOT_FOUND, "No user in request");
    }
    const user = await this.userModel
      .findById(userId)
      .populate("bundle")
      .exec();
    return (user?.bundle as Bundle) || null;
  }

  async getUserDataBalance(userId: string): Promise<number | null> {
    if (!userId) {
      throwAppException(ErrorCodes.USER_NOT_FOUND, "No user in request");
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
