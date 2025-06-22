import { ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../entities/user.entity.js";
import { env } from "../lib/env.js";
import { UsersService } from "../users/users.service.js";
import { eq } from "drizzle-orm";
import { verificationTokens } from "../db/schema.js";
import { DRIZZLE_ORM } from "../drizzle/constants.js";
import { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../db/schema.js";
import argon2 from "argon2";
import { sessions } from "../db/schema.js";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(DRIZZLE_ORM) private db: MySql2Database<typeof schema>,
  ) {}

  async verifyEmail(token: string): Promise<{ message: string }> {
    const [verificationRecord] = await this.db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token));

    if (!verificationRecord) {
      throw new UnauthorizedException("Invalid verification token.");
    }

    if (new Date() > verificationRecord.expiresAt) {
      throw new UnauthorizedException("Verification token has expired.");
    }

    await this.usersService.setUserAsVerified(verificationRecord.userId);

    await this.db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, token));

    return { message: "Email successfully verified." };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    console.log('[AuthService.validateUser] User from DB:', JSON.stringify(user, null, 2));

    if (!user) {
      console.log('[AuthService.validateUser] User not found.');
      return null;
    }

    if (!user.emailVerified) {
      console.log('[AuthService.validateUser] Email not verified.');
      throw new ForbiddenException("Please verify your email before logging in.");
    }

    const passwordIsValid = await user.validatePassword(pass);
    console.log(`[AuthService.validateUser] Password validation result for ${email}: ${passwordIsValid}`);

    if (passwordIsValid) {
      console.log('[AuthService.validateUser] Password is valid.');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword, ...result } = user;
      return result;
    }
    
    console.log('[AuthService.validateUser] Password is NOT valid.');
    return null;
  }

  async login(user: User) {
    console.log('[AuthService.login] Starting login process', { timestamp: new Date().toISOString(), userId: user.id });
    const tokens = await this.getTokens(user.id, user.email);
    console.log('[AuthService.login] Generated tokens', { 
      timestamp: new Date().toISOString(),
      accessTokenExp: new Date(Date.now() + 30 * 1000).toISOString(), // 30s
      refreshTokenExp: new Date(Date.now() + 60 * 1000).toISOString() // 1m
    });
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(refreshToken: string) {
    const allSessions = await this.db.query.sessions.findMany();
    let hashedTokenToDelete: string | null = null;

    for (const session of allSessions) {
      const isMatch = await argon2.verify(session.sessionToken as string, refreshToken);
      if (isMatch) {
        hashedTokenToDelete = session.sessionToken as string;
        break;
      }
    }

    if (hashedTokenToDelete) {
      await this.db.delete(sessions).where(eq(sessions.sessionToken, hashedTokenToDelete));
    }
  }

  async logoutAll(userId: string) {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async getSessions(userId: string) {
    return this.db.query.sessions.findMany({
      where: eq(sessions.userId, userId),
      columns: {
        sessionToken: true, // This is the hashed token
        expires: true,
      }
    });
  }

  async refreshTokens(userId: string, refreshToken: string, email: string) {
    console.log('[AuthService.refreshTokens] Starting token refresh', { 
      timestamp: new Date().toISOString(),
      userId 
    });

    const allUserSessions = await this.db.query.sessions.findMany({
      where: eq(sessions.userId, userId),
    });

    if (!allUserSessions.length) {
      console.log('[AuthService.refreshTokens] No sessions found', { 
        timestamp: new Date().toISOString(),
        userId 
      });
      throw new ForbiddenException("Access Denied: No sessions found.");
    }

    let matchedSession = null;
    for (const session of allUserSessions) {
      const isMatch = await argon2.verify(session.sessionToken as string, refreshToken);
      if (isMatch) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      console.log('[AuthService.refreshTokens] No matching session found', { 
        timestamp: new Date().toISOString(),
        userId 
      });
      throw new ForbiddenException("Access Denied: Refresh token mismatch.");
    }

    const expiryDate = new Date(matchedSession.expires);
    const now = new Date();

    console.log('[AuthService.refreshTokens] Checking token expiration', { 
      timestamp: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      isExpired: now > expiryDate,
      userId
    });

    if (now > expiryDate) {
      console.log('[AuthService.refreshTokens] Session expired, cleaning up', { 
        timestamp: now.toISOString(),
        userId 
      });
      await this.db.delete(sessions).where(eq(sessions.sessionToken, matchedSession.sessionToken as string));
      throw new ForbiddenException("Your session has expired. Please log in again.");
    }

    console.log('[AuthService.refreshTokens] Generating new access token', { 
      timestamp: new Date().toISOString(),
      userId 
    });
    const accessToken = await this.getAccessToken(userId, email);
    return { accessToken, status: 'authenticated' };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 1); // For testing: 1 minute

    console.log('[AuthService.updateRefreshToken] Saving new refresh token', { 
      timestamp: new Date().toISOString(),
      userId,
      expires: expires.toISOString()
    });

    await this.db.insert(sessions).values({
      userId,
      sessionToken: hashedRefreshToken,
      expires,
    });
  }

  async getAccessToken(userId: string, email: string): Promise<string> {
    console.log('[AuthService.getAccessToken] Generating access token', { 
      timestamp: new Date().toISOString(),
      userId,
      expiresIn: '30s'
    });
    return this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: env.JWT_ACCESS_SECRET,
        expiresIn: '30s', // For testing
      },
    );
  }

  async getTokens(userId: string, email: string) {
    console.log('[AuthService.getTokens] Starting token generation', { 
      timestamp: new Date().toISOString(),
      userId 
    });
    
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(userId, email),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: env.JWT_REFRESH_SECRET,
          expiresIn: '1m', // For testing
        },
      ),
    ]);

    console.log('[AuthService.getTokens] Tokens generated', { 
      timestamp: new Date().toISOString(),
      userId,
      accessTokenExp: new Date(Date.now() + 30 * 1000).toISOString(), // 30s
      refreshTokenExp: new Date(Date.now() + 60 * 1000).toISOString() // 1m
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
