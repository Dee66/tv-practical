export class BundleResponseDto {
  _id: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  subscriptionData: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(bundle: any) {
    this._id = bundle._id?.toString?.() ?? '';
    this.name = bundle.name ?? '';
    this.description = bundle.description ?? '';
    this.duration_days = bundle.duration_days ?? 0;
    this.price = bundle.price ?? 0;
    this.subscriptionData = bundle.subscriptionData ?? 0;
    this.createdAt = bundle.createdAt;
    this.updatedAt = bundle.updatedAt;
  }
}