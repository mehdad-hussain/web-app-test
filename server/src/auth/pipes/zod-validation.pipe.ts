import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodError, ZodSchema, z } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: error.flatten().fieldErrors,
          error: "Bad Request",
        });
      }
      throw new BadRequestException("Validation failed");
    }
    return value;
  }
}

export function createZodDto<T extends ZodSchema>(schema: T) {
  class ZodDto {
    constructor(data: z.infer<T>) {
      Object.assign(this, schema.parse(data));
    }
  }

  return ZodDto as new (data: z.infer<T>) => z.infer<T>;
}
