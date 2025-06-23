import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { Request } from 'express';
import * as schema from '../../db/schema';
import { sessions } from '../../db/schema';
import { DRIZZLE_ORM } from '../../drizzle/constants';
import { env } from '../../lib/env';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    @Inject(DRIZZLE_ORM) private db: MySql2Database<typeof schema>
  ) {
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

    // Decode the refresh token to get user ID
    const decoded = this.jwtService.decode(refreshToken) as { sub: string };
    
    // Check if the session is still active in the database
    const userSessions = await this.db.query.sessions.findMany({
      where: eq(sessions.userId, decoded.sub),
    });

    let sessionActive = false;
    for (const session of userSessions) {
      const isMatch = await argon2.verify(session.sessionToken as string, refreshToken);
      if (isMatch && session.isActive) {
        sessionActive = true;
        break;
      }
    }

    if (!sessionActive) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // Only after refresh token is validated and session is active, check access token
    return super.canActivate(context) as Promise<boolean>;
  }
} 