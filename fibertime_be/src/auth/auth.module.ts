import { Module, forwardRef, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { DeviceModule } from "../device/device.module";
import { otpRateLimiter } from "../otp/otp-rate-limit";
import { OtpModule } from "../otp/otp.module";
import { OTP, OTPSchema } from "../otp/otp.schema";
import { User, UserSchema } from "../user/user.schema";
import { UserService } from "../user/user.service";
import { WebSocketModule } from "../websocket/websocket.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { SubscriptionsModule } from "src/subscriptions/subscriptions.module";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "superman",
      signOptions: { expiresIn: "1h" },
    }),
    MongooseModule.forFeature([
      { name: OTP.name, schema: OTPSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => DeviceModule),
    forwardRef(() => WebSocketModule),
    forwardRef(() => OtpModule),
    SubscriptionsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(otpRateLimiter).forRoutes("auth/request-otp");
  }
}
