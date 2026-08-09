class ErrorHandler extends Error {
  statusCode: number;
  type?: string;

  constructor(statusCode: number, message: string, type?: string) {
    super(message);
    this.statusCode = statusCode;
    this.type = type ?? "apiError";
  }
}

export default ErrorHandler;
