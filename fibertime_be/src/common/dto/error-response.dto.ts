export class ErrorResponseDto {
  success: false = false;
  errorCode: string;
  message: string;
  details?: any;
}