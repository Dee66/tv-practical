import { Device } from '../device.schema';

export class DeviceResponseDto {
  _id: string;
  mac_address: string;
  pairingCode: string;
  status: string;
  expiresAt?: Date;
  bundle?: string | null;
  owner?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    device: Partial<Device> & {
      _id?: any;
      bundle?: any;
      owner?: any;
      createdAt?: Date;
      updatedAt?: Date;
    },
  ) {
    this._id = device._id?.toString?.() ?? '';
    this.mac_address = device.mac_address ?? '';
    this.pairingCode = device.pairingCode ?? '';
    this.status = device.status ?? '';
    this.expiresAt = device.expires_at;
    this.bundle = device.bundle
      ? typeof device.bundle === 'object' && device.bundle._id
        ? device.bundle._id.toString()
        : (device.bundle.toString?.() ?? device.bundle)
      : null;
    this.owner = device.owner
      ? typeof device.owner === 'object' && device.owner._id
        ? device.owner._id.toString()
        : device.owner.toString?.() ?? device.owner
      : null;
    this.createdAt = device.createdAt;
    this.updatedAt = device.updatedAt;
  }
}