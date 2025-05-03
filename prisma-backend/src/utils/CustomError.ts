class CustomError extends Error {
  data: null;
  success: boolean;
  constructor(public statusCode: number, message: string) {
    super(message);
    this.data = null;
    this.success = false;
    this.name = new.target.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
