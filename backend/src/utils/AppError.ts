export class AppError extends Error {
  statusCode: number;
  errors?: { path: string; message: string }[];

  constructor(
    message: string,
    statusCode = 500,
    errors?: { path: string; message: string }[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "AppError";
  }
}
