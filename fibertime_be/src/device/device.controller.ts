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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { DeviceStatus } from "./device.schema";
import { DeviceService } from "./device.service";
import { ConnectDeviceDto } from "./dto/connect-device.dto";
import { CreatePairingCodeDto } from "./dto/create-pairing-code.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("device")
@Controller("device")
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(private readonly deviceService: DeviceService) {}

  @ApiOperation({ summary: "Retrieve details of a device by its code" })
  @ApiParam({
    name: "deviceCode",
    description: "The unique code of the device",
  })
  @ApiResponse({ status: 200, description: "Device details returned" })
  @Get("device/:deviceCode")
  async getDeviceCode(@Param("deviceCode") deviceCode: string) {
    return this.deviceService.getDeviceByCode(deviceCode);
  }

  @ApiOperation({ summary: "Update the connection status of a device" })
  @ApiBody({
    schema: {
      example: {
        deviceCode: "ABCD",
        status: "connected",
      },
    },
  })
  @ApiResponse({ status: 200, description: "Connection status updated" })
  @Put("connection-status")
  async setConnectionStatus(
    @Body("deviceCode") deviceCode: string,
    @Body("status") status: DeviceStatus,
  ) {
    return this.deviceService.setConnectionStatus(deviceCode, status);
  }

  @ApiOperation({ summary: "Generate a pairing code for a TV device" })
  @ApiBody({
    schema: {
      example: {
        mac_address: "AA:BB:CC:DD:EE:01",
      },
    },
  })
  @ApiResponse({ status: 201, description: "Pairing code generated" })
  @Post("create-device-code")
  async generatePairingCode(@Body() createDeviceCodeDto: CreatePairingCodeDto) {
    return this.deviceService.createPairingCode(
      createDeviceCodeDto.mac_address,
    );
  }

  @ApiOperation({ summary: "Connect a TV device using a pairing code" })
  @ApiBody({
    schema: {
      example: {
        pairingCode: "ABCD",
      },
    },
  })
  @ApiResponse({ status: 200, description: "TV device connected" })
  @Post("connect-tv")
  async connectTv(@Body("pairingCode") pairingCode: string) {
    return await this.deviceService.pairDevice(pairingCode);
  }

  @ApiOperation({ summary: "Connect a device to a bundle" })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      example: {
        deviceId: "deviceObjectId",
        bundleId: "bundleObjectId",
      },
    },
  })
  @ApiResponse({ status: 200, description: "Device connected to bundle" })
  @UseGuards(JwtAuthGuard)
  @Post("connect-device")
  async connectDevice(@Body() connectDeviceDto: ConnectDeviceDto, @Req() req) {
    return this.deviceService.connectDeviceBundle(
      connectDeviceDto.deviceId,
      connectDeviceDto.bundleId,
      req.user._id,
    );
  }
}
