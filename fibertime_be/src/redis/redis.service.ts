import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import Redis from "ioredis";
import { ErrorCodes, ErrorCodeMessages } from "../common/constants/error-codes";

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
    });
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.set(key, value, "EX", ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      throw new HttpException(
        {
          errorCode: ErrorCodes.INTERNAL_ERROR,
          message: ErrorCodeMessages[ErrorCodes.INTERNAL_ERROR],
          details: error?.message || error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      throw new HttpException(
        {
          errorCode: ErrorCodes.INTERNAL_ERROR,
          message: ErrorCodeMessages[ErrorCodes.INTERNAL_ERROR],
          details: error?.message || error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      throw new HttpException(
        {
          errorCode: ErrorCodes.INTERNAL_ERROR,
          message: ErrorCodeMessages[ErrorCodes.INTERNAL_ERROR],
          details: error?.message || error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
