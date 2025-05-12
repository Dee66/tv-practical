import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Bundle } from "./bundle.schema";
import { CreateBundleDto } from "./dto/create-bundle.dto";
import { UpdateBundleDto } from "./dto/update-bundle.dto";
import { BundleResponseDto } from "./dto/bundle-response.dto";
import { throwAppException } from "../common/utils/throw-exception.util";
import { ErrorCodes } from "../common/constants/error-codes";

@Injectable()
export class BundleService {
  constructor(
    @InjectModel(Bundle.name) private readonly bundleModel: Model<Bundle>,
  ) {}

  async findAll(): Promise<BundleResponseDto[]> {
    const bundles = await this.bundleModel.find().exec();
    return bundles.map(bundle => new BundleResponseDto(bundle));
  }

  async findOne(id: string): Promise<BundleResponseDto> {
    const bundle = await this.bundleModel.findById(id).exec();
    if (!bundle) {
      throwAppException(ErrorCodes.NOT_FOUND);
    }
    return new BundleResponseDto(bundle);
  }

  async create(createBundleDto: CreateBundleDto): Promise<BundleResponseDto> {
    const existing = await this.bundleModel.findOne({
      name: createBundleDto.name,
    });
    if (existing) {
      throwAppException(ErrorCodes.VALIDATION_ERROR, "Bundle with this name already exists");
    }
    const bundle = await this.bundleModel.create(createBundleDto);
    return new BundleResponseDto(bundle);
  }

  async update(
    id: string,
    updateBundleDto: UpdateBundleDto,
  ): Promise<BundleResponseDto> {
    const bundle = await this.bundleModel.findByIdAndUpdate(
      id,
      { $set: updateBundleDto },
      { new: true },
    );
    if (!bundle) {
      throwAppException(ErrorCodes.NOT_FOUND);
    }
    return new BundleResponseDto(bundle);
  }
}
