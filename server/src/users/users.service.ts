import { Inject, Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { type MySql2Database } from "drizzle-orm/mysql2";
import { z } from "zod";
import { loginUserSchema, registerUserSchema, users } from "../db/schema.js";
import { DRIZZLE_ORM } from "../drizzle/constants.js";

type CreateUser = z.infer<typeof registerUserSchema>;
type LoginUser = z.infer<typeof loginUserSchema>;

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE_ORM)
    private db: MySql2Database<typeof import("../db/schema.js")>
  ) {}

  async create(userData: CreateUser): Promise<Omit<LoginUser, "hashedPassword" | "hashedRefreshToken">> {
    const { email, password } = userData;
    const userId = randomUUID();

    const hashedPassword = await argon2.hash(password);

    await this.db.insert(users).values({
      id: userId,
      email,
      hashedPassword,
    });

    const createdUser = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!createdUser) {
      throw new Error("Could not find created user");
    }

    const {  ...result } = createdUser;

    return result as Omit<LoginUser, "hashedPassword" | "hashedRefreshToken">;
  }

  async findOneByEmail(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user;
  }

  async findOneById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async setCurrentRefreshToken(refreshToken: string | null, userId: string) {
    if (!refreshToken) {
      await this.db.update(users).set({ hashedRefreshToken: null }).where(eq(users.id, userId));
      return;
    }
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.db.update(users).set({ hashedRefreshToken }).where(eq(users.id, userId));
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.findOneById(userId);

    if (!user || !user.hashedRefreshToken) return null;

    const isRefreshTokenMatching = await argon2.verify(user.hashedRefreshToken, refreshToken);

    if (isRefreshTokenMatching) {
      return user;
    }

    return null;
  }
}
