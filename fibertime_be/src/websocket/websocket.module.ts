import { Module, forwardRef } from "@nestjs/common";
import { WebSocketGatewayService } from "./websocket.gateway";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [WebSocketGatewayService],
  exports: [WebSocketGatewayService],
})
export class WebSocketModule {}