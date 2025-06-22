import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from "express";
import { env } from "../../lib/env.js";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Handle rate limiting separately
    if (exception instanceof ThrottlerException) {
      const responseBody = {
        statusCode: 429,
        timestamp: new Date().toISOString(),
        message: 'Too many requests'
      };
      httpAdapter.reply(response, responseBody, 429);
      return;
    }

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object = "Internal server error";

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null &&
        "message" in exceptionResponse &&
        typeof (exceptionResponse as any).message !== "string"
      ) {
        // Handle Zod validation error messages
        const zodErrors = (exceptionResponse as any).message;
        message = Object.values(zodErrors).flat().join("; ");
      } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const responseBody: {
      statusCode: number;
      timestamp: string;
      path?: string;
      message: string | object;
    } = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      message: message,
    };

    if (env.NODE_ENV !== "production") {
      responseBody.path = httpAdapter.getRequestUrl(request);
    }

    httpAdapter.reply(response, responseBody, httpStatus);
  }
} 