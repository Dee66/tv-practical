import { forwardRef, Inject } from "@nestjs/common";
import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { AuthService } from "../auth/auth.service";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
})
export class WebSocketGatewayService {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  emitOtpResponse(cellNumber: string, otp: string) {
    this.server.emit("otp-response", { cellNumber, otp });
  }

  emitOtpError(cellNumber: string, message: string, error: string) {
    this.server.emit("otp-error", { cellNumber, message, error });
  }

  emitDevicePaired(deviceId: string) {
    this.server.emit("paired", { deviceId });
  }

  emitDeviceDisconnected() {
    this.server.emit("disconnected");
  }
}
