import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("UserController", () => {
  let controller: UserController;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      getUserBundle: jest.fn(),
      getUserDataBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe("getUserBundle", () => {
    it("should return user bundle and data balance", async () => {
      const req = { user: { _id: "123" } };
      const bundle = { id: "bundle1" };
      const dataBalance = 42;

      mockUserService.getUserBundle.mockResolvedValue(bundle);
      mockUserService.getUserDataBalance.mockResolvedValue(dataBalance);

      const result = await controller.getUserBundle(req);

      expect(result).toEqual({ bundle, dataBalance });
      expect(mockUserService.getUserBundle).toHaveBeenCalledWith("123");
      expect(mockUserService.getUserDataBalance).toHaveBeenCalledWith("123");
    });

    it("should return null bundle and undefined dataBalance if user is not found", async () => {
      const req = { user: { _id: "123" } };
      mockUserService.getUserBundle.mockResolvedValue(null);

      const result = await controller.getUserBundle(req);

      expect(result).toEqual({ bundle: null, dataBalance: undefined });
      expect(mockUserService.getUserBundle).toHaveBeenCalledWith("123");
    });
  });
});