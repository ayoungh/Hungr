import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

@Injectable()
export class OriginValidationMiddleware implements NestMiddleware {
  constructor(private readonly config: ConfigService) {}

  use(request: Request, _response: Response, next: NextFunction): void {
    const origin = request.get("origin");
    const allowedOrigin = this.config.getOrThrow<string>("APP_ORIGIN");

    if (!SAFE_METHODS.has(request.method) && origin && origin !== allowedOrigin) {
      throw new ForbiddenException("Request origin is not allowed.");
    }

    next();
  }
}
