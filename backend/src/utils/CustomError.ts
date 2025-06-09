export class CustomError extends Error {
  data: null;
  success: boolean;
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.success = false;
    this.data = null;
    this.name = "Custom Error";
    Error.captureStackTrace(this, this.constructor);
  }
}
