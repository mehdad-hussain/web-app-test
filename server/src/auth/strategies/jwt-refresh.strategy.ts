import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { env } from '../../lib/env.js';
import { DRIZZLE_ORM } from '../../drizzle/constants.js';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { sessions } from '../../db/schema.js';
import argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(DRIZZLE_ORM) private db: MySql2Database<typeof schema>,
    private jwtService: JwtService
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.refresh_token;
      },
      secretOrKey: env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req?.cookies?.refresh_token;

    if (!refreshToken) {
      console.log('[RefreshTokenStrategy.validate] No refresh token found', {
        timestamp: new Date().toISOString()
      });
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // First verify if the JWT itself is expired
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: env.JWT_REFRESH_SECRET
      });
    } catch (error) {
      console.log('[RefreshTokenStrategy.validate] JWT token expired', {
        timestamp: new Date().toISOString(),
        userId: payload.sub
      });
      // Clean up any sessions for this user
      await this.db.delete(sessions).where(eq(sessions.userId, payload.sub));
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // Get all sessions for this user
    const userSessions = await this.db.query.sessions.findMany({
      where: eq(sessions.userId, payload.sub),
    });

    console.log('[RefreshTokenStrategy.validate] Found user sessions', {
      timestamp: new Date().toISOString(),
      userId: payload.sub,
      sessionCount: userSessions.length
    });

    if (!userSessions.length) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // Find matching session and verify it's not expired
    let matchedSession = null;
    for (const session of userSessions) {
      const isMatch = await argon2.verify(session.sessionToken as string, refreshToken);
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      console.log('[RefreshTokenStrategy.validate] No matching session found', {
        timestamp: new Date().toISOString(),
        userId: payload.sub
      });
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // Check DB session expiration
    const expiryDate = new Date(matchedSession.expires);
    const now = new Date();

    console.log('[RefreshTokenStrategy.validate] Checking session expiration', {
      timestamp: now.toISOString(),
      userId: payload.sub,
      sessionExpiry: expiryDate.toISOString(),
      isExpired: now > expiryDate
    });

    if (now > expiryDate) {
      console.log('[RefreshTokenStrategy.validate] Session expired in DB', {
        timestamp: now.toISOString(),
        userId: payload.sub
      });
      // Clean up expired session
      await this.db.delete(sessions).where(eq(sessions.sessionToken, matchedSession.sessionToken as string));
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
