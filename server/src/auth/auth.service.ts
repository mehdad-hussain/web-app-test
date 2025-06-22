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

    if (!user) {
      return null;
    }

    if (!user.emailVerified) {
      throw new ForbiddenException("Please verify your email before logging in.");
    }

    const passwordIsValid = await user.validatePassword(pass);

    if (passwordIsValid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: User) {
    const tokens = await this.getTokens(user.id, user.email);
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

    const allUserSessions = await this.db.query.sessions.findMany({
      where: eq(sessions.userId, userId),
    });

    if (!allUserSessions.length) {
  
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

      throw new ForbiddenException("Access Denied: Refresh token mismatch.");
    }

    const expiryDate = new Date(matchedSession.expires);
    const now = new Date();

    if (now > expiryDate) {

      await this.db.delete(sessions).where(eq(sessions.sessionToken, matchedSession.sessionToken as string));
      throw new ForbiddenException("Your session has expired. Please log in again.");
    }

    const accessToken = await this.getAccessToken(userId, email);
    return { accessToken, status: 'authenticated' };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 1); // For testing: 1 minute

    await this.db.insert(sessions).values({
      userId,
      sessionToken: hashedRefreshToken,
      expires,
    });
  }

  async getAccessToken(userId: string, email: string): Promise<string> {

    return this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: env.JWT_ACCESS_SECRET,
        expiresIn: '30s', // For testing
      },
    );
  }

  async getTokens(userId: string, email: string) {

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

    return {
      accessToken,
      refreshToken,
    };
  }
}
