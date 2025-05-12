import { User } from '../user.schema';

export class UserResponseDto {
  _id: string;
  cell_number: string;
  devices: string[];
  bundle?: string | null;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    user: Partial<User> & {
      _id?: any;
      devices?: any[];
      bundle?: any;
      createdAt?: Date;
      updatedAt?: Date;
    },
  ) {
    this._id = user._id?.toString?.() ?? "";
    this.cell_number = user.cell_number ?? "";
    this.devices = (user.devices ?? []).map((d: any) => d?.toString?.() ?? d);
    this.bundle = user.bundle
      ? typeof user.bundle === "object" && user.bundle._id
        ? user.bundle._id.toString()
        : (user.bundle.toString?.() ?? user.bundle)
      : null;
    this.role = user.role ?? "";
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}