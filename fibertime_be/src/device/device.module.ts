import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WebSocketModule } from "../websocket/websocket.module";
import { BundleModule } from "../bundle/bundle.module";
import { User, UserSchema } from "../user/user.schema";
import { Device, DeviceSchema } from "./device.schema";
import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";
import { JwtStrategy } from "../auth/jwt.strategy";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "superman",
      signOptions: { expiresIn: "1h" },
    }),
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    BundleModule,
    forwardRef(() => WebSocketModule),
    forwardRef(() => AuthModule),
    SubscriptionsModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService, JwtStrategy],
  exports: [MongooseModule, DeviceService],
})
export class DeviceModule {}
