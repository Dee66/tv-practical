import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Bundle } from "./bundle.schema";
import { CreateBundleDto } from "./dto/create-bundle.dto";
import { UpdateBundleDto } from "./dto/update-bundle.dto";

@Injectable()
export class BundleService {
  constructor(
    @InjectModel(Bundle.name) private readonly bundleModel: Model<Bundle>,
  ) {}

  async findAll() {
    return this.bundleModel.find().exec();
  }

  findOne(id: string) {
    return this.bundleModel.findById(id).exec();
  }

  // Create a new bundle (prevent duplicates by name)
  async create(createBundleDto: CreateBundleDto) {
    const existing = await this.bundleModel.findOne({
      name: createBundleDto.name,
    });
    if (existing) {
      throw new ConflictException("Bundle with this name already exists");
    }
    return await this.bundleModel.create(createBundleDto);
  }

  async update(id: string, updateBundleDto: UpdateBundleDto) {
    const bundle = await this.bundleModel.findByIdAndUpdate(
      id,
      { $set: updateBundleDto },
      { new: true },
    );
    if (!bundle) {
      throw new NotFoundException(`Bundle with id ${id} not found`);
    }
    return bundle;
  }
}
