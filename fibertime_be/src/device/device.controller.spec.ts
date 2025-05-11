import { Test, TestingModule } from "@nestjs/testing";
import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";
import { CreatePairingCodeDto } from "./dto/create-pairing-pairingCode.dto";
import { ConnectDeviceDto } from "./dto/connect-device.dto";
import { DeviceStatus } from "./device.schema";

describe("DeviceController", () => {
  let controller: DeviceController;
  let service: DeviceService;

  const mockDeviceService = {
    getDeviceByCode: jest.fn(),
    getConnectionStatus: jest.fn(),
    setConnectionStatus: jest.fn(),
    createPairingCode: jest.fn(),
    pairDevice: jest.fn(),
    connectDevice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        {
          provide: DeviceService,
          useValue: mockDeviceService,
        },
      ],
    }).compile();

    controller = module.get<DeviceController>(DeviceController);
    service = module.get<DeviceService>(DeviceService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getDeviceCode", () => {
    it("should return device details for a given device pairingCode", async () => {
      const deviceCode = "testCode";
      const result = { pairingCode: deviceCode, mac_address: "00:11:22:33:44:55" };
      mockDeviceService.getDeviceByCode.mockResolvedValue(result);

      expect(await controller.getDeviceCode(deviceCode)).toBe(result);
      expect(mockDeviceService.getDeviceByCode).toHaveBeenCalledWith(
        deviceCode,
      );
    });
  });

  describe("connectionStatus", () => {
    it("should return the connection status of a device", async () => {
      const deviceCode = "testCode";
      const result = { status: DeviceStatus.CONNECTED };
      mockDeviceService.getConnectionStatus.mockResolvedValue(result);

      expect(await controller.connectionStatus(deviceCode)).toBe(result);
      expect(mockDeviceService.getConnectionStatus).toHaveBeenCalledWith(
        deviceCode,
      );
    });
  });

  describe("setConnectionStatus", () => {
    it("should update the connection status of a device", async () => {
      const deviceCode = "testCode";
      const status = DeviceStatus.ACTIVE;
      const result = { success: true };
      mockDeviceService.setConnectionStatus.mockResolvedValue(result);

      expect(await controller.setConnectionStatus(deviceCode, status)).toBe(
        result,
      );
      expect(mockDeviceService.setConnectionStatus).toHaveBeenCalledWith(
        deviceCode,
        status,
      );
    });
  });

  describe("generatePairingCode", () => {
    it("should generate a pairing pairingCode for a device", async () => {
      const dto: CreatePairingCodeDto = { mac_address: "00:11:22:33:44:55" };
      const result = { pairingCode: "testCode" };
      mockDeviceService.createPairingCode.mockResolvedValue(result);

      expect(await controller.generatePairingCode(dto)).toBe(result);
      expect(mockDeviceService.createPairingCode).toHaveBeenCalledWith(
        dto.mac_address,
      );
    });
  });

  describe("connectTv", () => {
    it("should pair a TV using a pairingCode", async () => {
      const pairingCode = "testCode";
      const result = { success: true };
      mockDeviceService.pairDevice.mockResolvedValue(result);

      expect(await controller.connectTv(pairingCode)).toBe(result);
      expect(mockDeviceService.pairDevice).toHaveBeenCalledWith(pairingCode);
    });
  });

  describe("connectDevice", () => {
    it("should connect a device to a bundle", async () => {
      const dto: ConnectDeviceDto = {
        deviceId: "deviceId123",
        bundleId: "bundleId123",
      };
      const result = { success: true };
      mockDeviceService.connectDevice.mockResolvedValue(result);

      expect(await controller.connectDevice(dto)).toBe(result);
      expect(mockDeviceService.connectDevice).toHaveBeenCalledWith(
        dto.deviceId,
        dto.bundleId,
      );
    });
  });
});
