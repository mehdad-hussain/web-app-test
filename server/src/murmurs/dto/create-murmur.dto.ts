import { createZodDto } from "../../auth/pipes/zod-validation.pipe";
import { createMurmurSchema } from "../../db/schema/murmur.schema";

export class CreateMurmurDto extends createZodDto(createMurmurSchema) {} 