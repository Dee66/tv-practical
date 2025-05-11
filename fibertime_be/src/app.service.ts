import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getApiStatus() {
    return {
      status: "ok",
      message: "FiberTime API is up and running",
      docs: "/api",
      timestamp: new Date().toISOString(),
    };
  }
}
