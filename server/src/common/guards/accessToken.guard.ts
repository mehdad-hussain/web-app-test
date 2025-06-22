import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { env } from '../../lib/env.js';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = request.cookies?.refresh_token;

    // First check if refresh token exists
    if (!refreshToken) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // Then verify if refresh token is valid and not expired
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: env.JWT_REFRESH_SECRET
      });
    } catch (error) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // Only after refresh token is validated, check access token
    return super.canActivate(context) as Promise<boolean>;
  }
} 