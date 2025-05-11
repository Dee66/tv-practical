import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

describe("UserController", () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findOneWithBundles: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getUserBundles", () => {
    it("should return user bundles", async () => {
      const req = { user: { _id: "123" } };
      const bundles = [{ id: "bundle1" }];
      mockUserService.findOneWithBundles.mockResolvedValue({ bundles });

      const result = await controller.getUserBundles(req);

      expect(result).toEqual({ bundles });
      expect(mockUserService.findOneWithBundles).toHaveBeenCalledWith("123");
    });

    it("should throw an error if user is not found", async () => {
      const req = { user: { _id: "123" } };
      mockUserService.findOneWithBundles.mockResolvedValue(null);

      await expect(controller.getUserBundles(req)).rejects.toThrow(
        "User not found",
      );
    });
  });

  describe("findOne", () => {
    it("should return a user by id", async () => {
      const user = { id: "123", cell_number: "1234567890" };
      mockUserService.findOne.mockResolvedValue(user);

      const result = await controller.findOne("123");

      expect(result).toEqual(user);
      expect(mockUserService.findOne).toHaveBeenCalledWith("123");
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const createUserDto: CreateUserDto = { cell_number: "1234567890" };
      const user = { id: "123", ...createUserDto };
      mockUserService.create.mockResolvedValue(user);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(user);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe("update", () => {
    it("should update a user by id", async () => {
      const updateUserDto: UpdateUserDto = { cell_number: "0987654321" };
      const user = { id: "123", ...updateUserDto };
      mockUserService.update.mockResolvedValue(user);

      const result = await controller.update("123", updateUserDto);

      expect(result).toEqual(user);
      expect(mockUserService.update).toHaveBeenCalledWith("123", updateUserDto);
    });
  });
});
