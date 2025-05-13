import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Bundle, BundleDocument } from "../bundle/bundle.schema";
import { ErrorCodeMessages, ErrorCodes } from "../common/constants/error-codes";
import { throwAppException } from "../common/utils/throw-exception.util";
import {
  Subscription,
  SubscriptionStatus,
} from "../subscriptions/subscriptions.schema";
import { User, UserDocument } from "../user/user.schema";
import { WebSocketGatewayService } from "../websocket/websocket.gateway";
import { Device, DeviceDocument, DeviceStatus } from "./device.schema";
import { DeviceResponseDto } from "./dto/device-response.dto";

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<Subscription>,
    @InjectModel(Bundle.name)
    private readonly bundleModel: Model<BundleDocument>,
    @Inject(forwardRef(() => WebSocketGatewayService))
    private readonly webSocketGateway: WebSocketGatewayService,
  ) { }

  async getDeviceByCode(deviceCode: string): Promise<DeviceResponseDto> {
    const device = await this.deviceModel.findOne({ pairingCode: deviceCode });
    if (!device) {
      throwAppException(
        ErrorCodes.NOT_FOUND,
        `No device found with the provided code ${deviceCode}`,
      );
    }
    return new DeviceResponseDto(device);
  }

  async getUserDevice(userId: string): Promise<DeviceResponseDto | null> {
    const device = await this.deviceModel
      .findOne({ owner: userId, status: DeviceStatus.ACTIVE })
      .exec();
    return device ? new DeviceResponseDto(device) : null;
  }

  async setConnectionStatus(
    deviceCode: string,
    deviceStatus: DeviceStatus,
  ): Promise<DeviceResponseDto> {
    this.logger.log(
      `[PUT] setConnectionStatus called: code=${deviceCode}, status=${deviceStatus}`,
    );

    const device = await this.deviceModel.findOne({ pairingCode: deviceCode });
    if (!device) {
      throwAppException(
        ErrorCodes.NOT_FOUND,
        `Device with code ${deviceCode} not found`,
      );
    }
    device.status = deviceStatus;
    await device.save();
    return new DeviceResponseDto(device);
  }

  async createDevice(
    userId: string,
    status: DeviceStatus,
    macAddress: string,
  ): Promise<DeviceResponseDto> {
    const device = await this.deviceModel.create({
      owner: userId,
      status: status,
      mac_address: macAddress,
      pairingCode: this.generatePairingCode(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
    await device.save();
    return new DeviceResponseDto(device);
  }

  async createPairingCode(mac_address: string): Promise<DeviceResponseDto> {
    try {
      const pairingCode = this.generatePairingCode();
      const expiresAt = this.calculateExpiry(5);
      const device = await this.upsertDevice(
        mac_address,
        pairingCode,
        expiresAt,
      );
      return new DeviceResponseDto(device);
    } catch (err) {
      this.logger.error("Error in createPairingCode:", err);
      throw new HttpException(
        {
          errorCode: ErrorCodes.INTERNAL_ERROR,
          message: ErrorCodeMessages[ErrorCodes.INTERNAL_ERROR],
          details: err?.message || err,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generatePairingCode(): string {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  private calculateExpiry(minutes: number): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private async upsertDevice(
    macAddress: string,
    pairingCode: string,
    expiresAt: Date,
  ): Promise<DeviceDocument> {
    let device: DeviceDocument | null = await this.deviceModel.findOne({
      mac_address: macAddress,
    });
    if (device) {
      device.pairingCode = pairingCode;
      device.expires_at = expiresAt;
      device.status = DeviceStatus.ACTIVE;
      await device.save();
    } else {
      device = (await this.deviceModel.create({
        mac_address: macAddress,
        pairingCode: pairingCode,
        expires_at: expiresAt,
        status: DeviceStatus.ACTIVE,
      })) as DeviceDocument;
    }
    return device;
  }

  private async linkBundleToUser(userId: string, bundleId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throwAppException(
        ErrorCodes.USER_NOT_FOUND,
        `User with id ${userId} not found`,
      );
    }
    // Set the bundle only if it's different
    if (!user.bundle || user.bundle.toString() !== bundleId) {
      user.bundle = new Types.ObjectId(bundleId);
      await user.save();
    }
    return user;
  }

  async connectDeviceBundle(
    deviceId: string,
    bundleId: string,
    userId: string,
  ): Promise<DeviceResponseDto> {
    const device = await this.deviceModel.findOne({ _id: deviceId });
    if (!device) {
      throwAppException(
        ErrorCodes.NOT_FOUND,
        "Device not found, unable to link Bundle",
      );
    }
    device.bundle = new Types.ObjectId(bundleId);
    device.status = DeviceStatus.CONNECTED;
    await device.save();

    await this.linkBundleToUser(userId, bundleId);

    // Remove any existing active subscription for this user
    await this.subscriptionModel.deleteMany({
      user: userId,
      status: SubscriptionStatus.ACTIVE,
    });

    // Fetch the bundle to get the data amount
    const bundle = await this.bundleModel.findById(bundleId);
    if (!bundle) {
      throwAppException(ErrorCodes.NOT_FOUND, "Bundle not found");
    }

    // Create new subscription
    await this.subscriptionModel.create({
      user: userId,
      bundle: bundleId,
      dataBalance: bundle.subscriptionData,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(
        Date.now() + bundle.duration_days * 24 * 60 * 60 * 1000,
      ),
    });

    return new DeviceResponseDto(device);
  }

  async pairDevice(pairingCode: string): Promise<DeviceResponseDto> {
    const device = await this.deviceModel.findOne({ pairingCode });
    if (!device) {
      throwAppException(ErrorCodes.NOT_FOUND, "Pairing code not found");
    }

    if (device.status === DeviceStatus.CONNECTED) {
      throwAppException(ErrorCodes.VALIDATION_ERROR, "Device already paired");
    }

    if (device.expires_at && new Date() > device.expires_at) {
      throwAppException(ErrorCodes.VALIDATION_ERROR, "Pairing code expired");
    }

    // Update device status to PAIRED
    device.status = DeviceStatus.PAIRED;
    await device.save();

    // Emit the paired event
    this.webSocketGateway.emitDevicePaired(device._id);

    return new DeviceResponseDto(device);
  }

  async linkDevice(
    pairingCode: string,
    userId: string,
  ): Promise<DeviceResponseDto> {
    const device = await this.deviceModel.findOne({ pairingCode });
    if (!device) {
      throwAppException(ErrorCodes.NOT_FOUND, "Pairing code not found");
    }

    // Add the device to the user's devices array if not already present
    const user = await this.userModel.findById(userId);
    if (!user) {
      throwAppException(ErrorCodes.USER_NOT_FOUND, "User not found");
    }
    if (!user.devices.some((d) => d.toString() === device._id.toString())) {
      user.devices.push(device._id);
      await user.save();
    }

    // Optionally update device status
    device.status = DeviceStatus.CONNECTED;
    await device.save();

    // Optionally emit a WebSocket event
    this.webSocketGateway.emitDevicePaired(device._id);

    return new DeviceResponseDto(device);
  }
}
