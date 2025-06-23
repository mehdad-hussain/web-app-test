import { createZodDto } from "../../auth/pipes/zod-validation.pipe";
import { paginationSchema } from "../../db/schema/murmur.schema";

export class PaginationDto extends createZodDto(paginationSchema) {} 