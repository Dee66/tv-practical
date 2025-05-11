import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Bundle, BundleSchema } from "./bundle.schema";
import { BundleService } from "./bundle.service";
import { BundleController } from "./bundle.controller";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bundle.name, schema: BundleSchema }]),
  ],
  controllers: [BundleController],
  providers: [BundleService],
  exports: [MongooseModule, BundleService],
})
export class BundleModule {}
