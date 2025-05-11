import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtStrategy } from "src/auth/jwt.strategy";
import { JwtModule } from "@nestjs/jwt";
import { SubscriptionsModule } from "src/subscriptions/subscriptions.module";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "superman",
      signOptions: { expiresIn: "1h" },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
    SubscriptionsModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  exports: [MongooseModule, UserService],
})
export class UserModule {}
