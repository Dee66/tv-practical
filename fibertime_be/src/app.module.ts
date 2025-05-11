import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DeviceModule } from "./device/device.module";
import { UserModule } from "./user/user.module";
import { OtpModule } from "./otp/otp.module";
import { BundleModule } from "./bundle/bundle.module";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || "mongodb://fibertime_mongo:27017/fibertime",
      {},
    ),
    AuthModule,
    BundleModule,
    DeviceModule,
    OtpModule,
    UserModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
