import { ApiProperty } from '@nestjs/swagger';

export class CreateMurmurDto {
  @ApiProperty({ example: 'Hello world!', minLength: 1, maxLength: 280, description: 'Content of the murmur (1-280 chars)' })
  content: string;
} 