import { Test, TestingModule } from "@nestjs/testing";
import { BundleController } from "./bundle.controller";
import { BundleService } from "./bundle.service";

describe("BundleController", () => {
  let controller: BundleController;
  let mockBundleService: any;

  beforeEach(async () => {
    mockBundleService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BundleController],
      providers: [
        { provide: BundleService, useValue: mockBundleService },
      ],
    }).compile();

    controller = module.get<BundleController>(BundleController);
  });

  describe("findAll", () => {
    it("should return an array of bundles", async () => {
      const result = [{ id: "1", name: "Test Bundle" }];
      mockBundleService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual({ bundles: result });
      expect(mockBundleService.findAll).toHaveBeenCalled();
    });
  });
});