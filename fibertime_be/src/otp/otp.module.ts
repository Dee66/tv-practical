import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OTP, OTPSchema } from "./otp.schema";
import { User, UserSchema } from "../user/user.schema";
import { OtpService } from "./otp.service";
import { OtpController } from "./otp.controller";
import { WebSocketModule } from "../websocket/websocket.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OTP.name, schema: OTPSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => WebSocketModule),
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule { }
