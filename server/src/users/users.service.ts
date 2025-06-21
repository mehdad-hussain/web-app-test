import { Inject, Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { insertUserSchema, selectUserSchema, users } from "src/db/schema";
import { DRIZZLE_ORM } from "src/drizzle/constants";
import { z } from "zod";

const createUserSchema = insertUserSchema.extend({
  password: z.string().min(1),
});

type CreateUser = z.infer<typeof createUserSchema>;
type SelectUser = z.infer<typeof selectUserSchema>;

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE_ORM)
    private db: MySql2Database<typeof import("src/db/schema")>
  ) {}

  async create(userData: CreateUser): Promise<Omit<SelectUser, "hashedPassword" | "hashedRefreshToken">> {
    const { email, password } = userData;
    const hashedPassword = await argon2.hash(password);
    const userId = randomUUID();

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

    const { hashedPassword: _, hashedRefreshToken: __, ...result } = createdUser;

    return result;
  }

  async findOneByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findOneById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
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
