/**
 * DeviceController
 *
 * This controller handles all operations related to devices, including retrieving device details,
 * managing connection statuses, generating pairing codes, and connecting devices to bundles.
 */
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DeviceStatus } from "./device.schema";
import { DeviceService } from "./device.service";
import { ConnectDeviceDto } from "./dto/connect-device.dto";
import { CreatePairingCodeDto } from "./dto/create-pairing-code.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("device")
@Controller("device")
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) { }

  /**
   * GET /device/:deviceCode
   *
   * Endpoint to retrieve details of a device by its code.
   *
   * @param deviceCode - The unique code of the device.
   * @returns The details of the specified device.
   */

  @Get("device/:deviceCode")
  async getDeviceCode(@Param("deviceCode") deviceCode: string) {
    return this.deviceService.getDeviceByCode(deviceCode);
  }

  /**
   * PUT /device/connection-status
   *
   * Endpoint to update the connection status of a device.
   *
   * @param deviceCode - The unique code of the device.
   * @param status - The new connection status of the device.
   * @returns The updated connection status of the device.
   */
  @Put("connection-status")
  async setConnectionStatus(
    @Body("deviceCode") deviceCode: string,
    @Body("status") status: DeviceStatus,
  ) {
    return this.deviceService.setConnectionStatus(deviceCode, status);
  }

  /**
   * GET /device/connection-status/:deviceCode
   *
   * Endpoint to retrieve the connection status of a device.
   *
   * @param deviceId - The unique code of the device.
   * @returns The connection status of the specified device.
   */
  @Get("connection-status/:deviceId")
  async connectionStatus(@Param("deviceId") deviceId: string) {
    return this.deviceService.getConnectionStatus(deviceId);
  }

  /**
   * POST /device/create-device-code
   *
   * Endpoint to generate a pairing code for a TV device.
   *
   * @param createDeviceCodeDto - The data transfer object containing the MAC address of the device.
   * @returns The generated pairing code.
   */
  @Post("create-device-code")
  async generatePairingCode(@Body() createDeviceCodeDto: CreatePairingCodeDto) {
    return this.deviceService.createPairingCode(
      createDeviceCodeDto.mac_address,
    );
  }

  /**
   * POST /device/connect-tv
   * Endpoint to connect a TV device using a pairing code.
   *
   * @param pairingCode - The pairing code of the TV device.
   * @returns The result of the connection process.
   */
  @Post("connect-tv")
  async connectTv(@Body("pairingCode") pairingCode: string) {
    return await this.deviceService.pairDevice(pairingCode);
  }

  /**
   * POST /device/connect-device
   *
   * Endpoint to connect a device to a bundle.
   *
   * @param connectDeviceDto - The data transfer object containing the device ID and bundle ID.
   * @returns The result of the connection process.
   */

  @Post("connect-device")
  @UseGuards(JwtAuthGuard)
  async connectDevice(@Body() connectDeviceDto: ConnectDeviceDto, @Req() req) {
    // req.user._id comes from your JwtStrategy
    return this.deviceService.connectDeviceBundle(
      connectDeviceDto.deviceId,
      connectDeviceDto.bundleId,
      req.user._id,
    );
  }
}
