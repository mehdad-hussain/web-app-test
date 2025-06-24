import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ example: 1, minimum: 1, description: 'Page number (min 1)' })
  page: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 100, description: 'Items per page (1-100)' })
  limit: number;
} 