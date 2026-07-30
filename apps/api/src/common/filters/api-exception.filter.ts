import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";

const errorCodes: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "BAD_REQUEST",
  [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
  [HttpStatus.FORBIDDEN]: "FORBIDDEN",
  [HttpStatus.NOT_FOUND]: "NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT",
  [HttpStatus.TOO_MANY_REQUESTS]: "RATE_LIMITED",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "INTERNAL_ERROR",
};

interface ExceptionBody {
  code?: string;
  message?: string | string[];
  error?: string;
  details?: unknown;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const body: ExceptionBody =
      typeof raw === "object" && raw !== null ? raw : {};

    if (status >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const validationMessages = Array.isArray(body.message)
      ? body.message
      : undefined;
    const message =
      status >= 500
        ? "Internal server error."
        : validationMessages
          ? "Request validation failed."
          : typeof body.message === "string"
            ? body.message
            : typeof raw === "string"
              ? raw
              : "Request failed.";

    response.status(status).json({
      error: {
        code: body.code ?? errorCodes[status] ?? "REQUEST_FAILED",
        message,
        ...(validationMessages
          ? { details: validationMessages }
          : body.details !== undefined
            ? { details: body.details }
            : {}),
      },
    });
  }
}
