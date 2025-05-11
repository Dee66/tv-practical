import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "../user/user.schema";
import { WebSocketGatewayService } from "../websocket/websocket.gateway"; // Import WebSocket service
import { Device, DeviceDocument, DeviceStatus } from "./device.schema";
import {
  Subscription,
  SubscriptionStatus,
} from "../subscriptions/subscriptions.schema";
import { Bundle, BundleDocument } from "../bundle/bundle.schema";

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
  ) {}

  async getConnectionStatus(deviceId: string) {
    // todo DP --> bit of a problem as connection-status GET, according to the spec, has to use deviceId for lookup
    // currently the device schema does not support ID.
    // investigare
    const device = await this.deviceModel.findOne({ pairingCode: deviceId });
    if (!device) {
      throw new NotFoundException("Device not found");
    }
    return {
      deviceId: device._id as string,
      status: device.status,
      isConnected: device.status === DeviceStatus.CONNECTED,
    };
  }

  // GET /api/device/device?device-code=XXXX
  async getDeviceByCode(deviceCode: string) {
    const device = await this.deviceModel.findOne({ pairingCode: deviceCode });
    if (!device) {
      return {
        message: `No device found with the provided code ${deviceCode}`,
        device: null,
      };
    }
    return {
      deviceId: device._id as string,
      macAddress: device.mac_address,
      status: device.status,
      expiresAt: device.expires_at,
      code: device.pairingCode,
    };
  }

  async getUserDevice(userId: string): Promise<Device | null> {
    const device = await this.deviceModel
      .findOne({ owner: userId, status: "ACTIVE" })
      .exec();
    return device || null;
  }

  // todo DP --> too much going on here
  // improve
  async getOrCreateDevice(userId: string): Promise<Device> {
    let device = await this.deviceModel
      .findOne({ owner: userId, status: "ACTIVE" })
      .exec();

    if (!device) {
      device = await this.deviceModel.create({
        owner: userId,
        status: DeviceStatus.ACTIVE,
        mac_address: "auto-generated-or-placeholder", // todo DP --> FIX!!
        pairingCode: this.generatePairingCode(),
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });

      // Link device to the user
      await this.userModel.updateOne(
        { _id: userId },
        { $addToSet: { devices: device._id } },
      );
    }

    return device;
  }

  async setConnectionStatus(deviceCode: string, deviceStatus: DeviceStatus) {
    this.logger.log(
      `[PUT] setConnectionStatus called: code=${deviceCode}, status=${deviceStatus}`,
    );

    const device = await this.deviceModel.findOne({ pairingCode: deviceCode });
    if (!device) {
      throw new NotFoundException("Device not found");
    }
    device.status = deviceStatus;
    await device.save();
    return {
      deviceId: device._id as string,
      status: device.status,
    };
  }

  async createDevice(
    userId: string,
    status: DeviceStatus,
    macAddress: string,
  ): Promise<Device> {
    const device = await this.deviceModel.create({
      owner: userId,
      status: status,
      mac_address: macAddress,
      pairingCode: this.generatePairingCode(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
    await device.save();
    return device;
  }

  async createPairingCode(mac_address: string) {
    try {
      const pairingCode = this.generatePairingCode();
      const expiresAt = this.calculateExpiry(5);
      const device = await this.upsertDevice(
        mac_address,
        pairingCode,
        expiresAt,
      );
      return {
        deviceId: device._id as string,
        pairingCode: device.pairingCode,
        expiresAt: device.expires_at,
        status: device.status,
      };
    } catch (err) {
      this.logger.error("Error in createPairingCode:", err);
      throw err;
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
      throw new NotFoundException("User not found, unable to link Bundle");
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
  ) {
    const device = await this.deviceModel.findOne({ _id: deviceId });
    if (!device) {
      throw new NotFoundException("Device not found, unable to link Bundle");
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
      throw new NotFoundException("Bundle not found");
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

    return {
      deviceId: device._id as string,
      status: device.status,
      bundle: device.bundle,
    };
  }

  async pairDevice(pairingCode: string): Promise<Record<string, any>> {
    const device = await this.deviceModel.findOne({ pairingCode });
    if (!device) {
      throw new NotFoundException("Pairing code not found");
    }

    if (device.status === DeviceStatus.CONNECTED) {
      throw new BadRequestException("Device already paired");
    }

    if (device.expires_at && new Date() > device.expires_at) {
      throw new BadRequestException("Pairing code expired");
    }

    // Update device status to PAIRED
    device.status = DeviceStatus.PAIRED;
    await device.save();

    // Emit the paired event
    this.webSocketGateway.emitDevicePaired(device._id);

    return {
      deviceId: device._id as string,
      macAddress: device.mac_address,
      status: device.status,
      expiresAt: device.expires_at,
      bundle: device.bundle,
    };
  }
}
