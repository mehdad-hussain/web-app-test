import { ApiProperty } from '@nestjs/swagger';

export class RevokeSessionDto {
  @ApiProperty({ example: 'session_token_123', description: 'Session token to revoke' })
  sessionToken: string;
} 