import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Controller("redis")
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post("set")
  async setKey(
    @Body("key") key: string,
    @Body("value") value: string,
    @Body("ttl") ttl?: number,
  ): Promise<string> {
    await this.redisService.set(key, value, ttl);
    return "Key set successfully";
  }

  @Get("get")
  async getKey(@Query("key") key: string): Promise<string | null> {
    return this.redisService.get(key);
  }

  @Post("delete")
  async deleteKey(@Body("key") key: string): Promise<string> {
    const result = await this.redisService.del(key);
    return result > 0 ? "Key deleted successfully" : "Key not found";
  }
}
