import { Test, TestingModule } from "@nestjs/testing";
import { BundleController } from "./bundle.controller";
import { BundleService } from "./bundle.service";
import { CreateBundleDto } from "./dto/create-bundle.dto";
import { UpdateBundleDto } from "./dto/update-bundle.dto";

describe("BundleController", () => {
  let controller: BundleController;
  let service: BundleService;

  const mockBundleService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BundleController],
      providers: [
        {
          provide: BundleService,
          useValue: mockBundleService,
        },
      ],
    }).compile();

    controller = module.get<BundleController>(BundleController);
    service = module.get<BundleService>(BundleService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of bundles", async () => {
      const result = [{ id: "1", name: "Test Bundle" }];
      mockBundleService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockBundleService.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a single bundle", async () => {
      const result = { id: "1", name: "Test Bundle" };
      mockBundleService.findOne.mockResolvedValue(result);

      expect(await controller.findOne("1")).toBe(result);
      expect(mockBundleService.findOne).toHaveBeenCalledWith("1");
    });
  });

  describe("create", () => {
    it("should create a new bundle", async () => {
      const createDto: CreateBundleDto = {
        name: "New Bundle",
        description: "",
        duration_days: 0,
        price: 0,
      };
      const result = { id: "1", ...createDto };
      mockBundleService.create.mockResolvedValue(result);

      expect(await controller.create(createDto)).toBe(result);
      expect(mockBundleService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("update", () => {
    it("should update an existing bundle", async () => {
      const updateDto: UpdateBundleDto = { name: "Updated Bundle" };
      const result = { id: "1", ...updateDto };
      mockBundleService.update.mockResolvedValue(result);

      expect(await controller.update("1", updateDto)).toBe(result);
      expect(mockBundleService.update).toHaveBeenCalledWith("1", updateDto);
    });
  });
});
