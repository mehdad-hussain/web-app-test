import { ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { Request } from 'express';
import * as schema from "../db/schema";
import { sessions, verificationTokens } from "../db/schema";
import { DRIZZLE_ORM } from "../drizzle/constants";
import { User } from "../entities/user.entity";
import { env } from "../lib/env";
import { UsersService } from "../users/users.service";

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

  async login(user: User, req: Request) {
    const tokens = await this.getTokens(user.id, user.email);
    const deviceInfo = req.headers['user-agent'] ?? 'Unknown';
    const ipAddress = req.ip;
    await this.createSession(user.id, tokens.refreshToken, deviceInfo, ipAddress);
    return tokens;
  }

  async logout(userId: string, refreshToken: string) {
    const userSessions = await this.db.query.sessions.findMany({
      where: eq(sessions.userId, userId),
    });

    let sessionToDeactivate: (typeof schema.sessions.$inferSelect) | null = null;
    for (const session of userSessions) {
      const isMatch = await argon2.verify(session.sessionToken as string, refreshToken);
      if (isMatch) {
        sessionToDeactivate = session;
        break;
      }
    }

    if (sessionToDeactivate) {
      await this.db
        .update(sessions)
        .set({ isActive: false })
        .where(eq(sessions.sessionToken, sessionToDeactivate.sessionToken as string));
    }
  }

  async logoutAll(userId: string) {
    await this.db
      .update(sessions)
      .set({ isActive: false })
      .where(eq(sessions.userId, userId));
  }

  async getSessions(userId: string) {
    return this.db.query.sessions.findMany({
      where: and(eq(sessions.userId, userId), eq(sessions.isActive, true)),
      columns: {
        sessionToken: true,
        deviceInfo: true,
        ipAddress: true,
        lastUsed: true,
        expires: true,
        isActive: true,
      }
    });
  }

  async revokeSession(userId: string, sessionToken: string) {
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.sessionToken, sessionToken), eq(sessions.userId, userId)));

    if (!session) {
      throw new ForbiddenException("Session not found or you don't have permission to revoke it.");
    }
    
    await this.db
      .update(sessions)
      .set({ isActive: false })
      .where(eq(sessions.sessionToken, sessionToken));
  }

  async refreshTokens(userId: string, refreshToken: string, email: string) {

    const allUserSessions = await this.db.query.sessions.findMany({
      where: and(eq(sessions.userId, userId), eq(sessions.isActive, true)),
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

      await this.db.update(sessions).set({ isActive: false }).where(eq(sessions.sessionToken, matchedSession.sessionToken as string));
      throw new ForbiddenException("Your session has expired. Please log in again.");
    }

    await this.db.update(sessions).set({ lastUsed: new Date() }).where(eq(sessions.sessionToken, matchedSession.sessionToken as string));

    const accessToken = await this.getAccessToken(userId, email);
    return { accessToken, status: 'authenticated' };
  }

  async createSession(userId: string, refreshToken: string, deviceInfo: string, ipAddress: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 1); // For testing: 1 minute

    await this.db.insert(sessions).values({
      userId,
      sessionToken: hashedRefreshToken,
      expires,
      deviceInfo,
      ipAddress,
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
