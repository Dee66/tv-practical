import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorResponseDto } from "../dto/error-response.dto";
import { ErrorCodes, ErrorCodeMessages } from "../constants/error-codes";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = ErrorCodes.INTERNAL_ERROR;
    let message = ErrorCodeMessages[ErrorCodes.INTERNAL_ERROR];
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "object" && res !== null) {
        const obj = res as any;
        errorCode = obj.errorCode || this.mapStatusToErrorCode(status);
        message = obj.message || ErrorCodeMessages[errorCode] || message;
        details = obj.details;
      } else if (typeof res === "string") {
        errorCode = this.mapStatusToErrorCode(status);
        message = res || ErrorCodeMessages[errorCode] || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    // Handle validation errors from ValidationPipe
    if (
      typeof (exception as any).getResponse === "function" &&
      (exception as any).getResponse().message &&
      Array.isArray((exception as any).getResponse().message)
    ) {
      errorCode = ErrorCodes.VALIDATION_ERROR;
      details = (exception as any).getResponse().message;
      message = ErrorCodeMessages[ErrorCodes.VALIDATION_ERROR];
      status = HttpStatus.BAD_REQUEST;
    }

    const errorResponse: ErrorResponseDto = {
      success: false,
      errorCode,
      message,
      ...(details ? { details } : {}),
    };

    response.status(status).json(errorResponse);
  }

  private mapStatusToErrorCode(status: number): ErrorCodes {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ErrorCodes.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCodes.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCodes.NOT_FOUND;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCodes.RATE_LIMITED;
      case HttpStatus.BAD_REQUEST:
        return ErrorCodes.VALIDATION_ERROR;
      default:
        return ErrorCodes.INTERNAL_ERROR;
    }
  }
}
