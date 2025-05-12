export enum ErrorCodes {
  INTERNAL_ERROR = "INTERNAL_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  OTP_INVALID = "OTP_INVALID",
  RATE_LIMITED = "RATE_LIMITED",
}

// User-friendly messages for each error code
export const ErrorCodeMessages: Record<ErrorCodes, string> = {
  [ErrorCodes.INTERNAL_ERROR]: "Something went wrong on our end. Please try again.",
  [ErrorCodes.VALIDATION_ERROR]: "Your request is invalid. Please check your input.",
  [ErrorCodes.UNAUTHORIZED]: "You are not authorized. Please log in.",
  [ErrorCodes.FORBIDDEN]: "You do not have permission to perform this action.",
  [ErrorCodes.NOT_FOUND]: "The requested resource was not found.",
  [ErrorCodes.USER_NOT_FOUND]: "The specified user could not be found.",
  [ErrorCodes.OTP_INVALID]: "The provided OTP is invalid or expired.",
  [ErrorCodes.RATE_LIMITED]: "Too many requests. Please try again later.",
};