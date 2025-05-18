export class ApiResponse {
  public success: boolean;
  constructor(
    public statusCode: number,
    public message: string,
    public data: any,
  ) {
    this.success = statusCode < 400;
  }
}
