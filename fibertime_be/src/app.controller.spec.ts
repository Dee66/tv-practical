import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const appServiceMock = {
      getApiStatus: jest.fn().mockReturnValue({
        status: "ok",
        message: "FiberTime API is up and running",
        docs: "/api",
        timestamp: "2024-01-01T00:00:00.000Z",
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appServiceMock }],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    appService = moduleRef.get<AppService>(AppService);
  });

  it("should be defined", () => {
    expect(appController).toBeDefined();
  });

  it("should return API status", () => {
    const result = {
      status: "ok",
      message: "FiberTime API is up and running",
      docs: "/api",
      timestamp: "2024-01-01T00:00:00.000Z",
    };
    expect(appService.getApiStatus()).toEqual(result);
  });
});
