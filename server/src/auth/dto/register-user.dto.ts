import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8, description: 'Password (min 8 chars)' })
  password: string;
} 