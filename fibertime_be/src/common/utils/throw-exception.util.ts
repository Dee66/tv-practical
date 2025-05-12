import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ErrorCodeMessages, ErrorCodes } from "../constants/error-codes";

const errorCodeToException = {
  [ErrorCodes.NOT_FOUND]: NotFoundException,
  [ErrorCodes.OTP_INVALID]: BadRequestException,
  [ErrorCodes.VALIDATION_ERROR]: BadRequestException,
  [ErrorCodes.USER_NOT_FOUND]: UnauthorizedException,
  [ErrorCodes.INTERNAL_ERROR]: HttpException,
  // Add more mappings as needed
};

export function throwAppException(
  errorCode: ErrorCodes,
  details?: any,
  status?: number,
): never {
  const ExceptionClass = errorCodeToException[errorCode] || HttpException;
  const payload = {
    errorCode,
    message: ErrorCodeMessages[errorCode],
    ...(details ? { details } : {}),
  };
  if (ExceptionClass === HttpException) {
    throw new HttpException(
      payload,
      status ?? HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  throw new ExceptionClass(payload);
}
