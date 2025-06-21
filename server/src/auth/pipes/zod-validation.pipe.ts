import { ArgumentMetadata, BadRequestException, HttpStatus, PipeTransform } from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.flatten().fieldErrors,
          error: "Bad Request",
        });
      }
      throw new BadRequestException("Validation failed");
    }
    return value;
  }
}
