import { Inject, Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";
import { z } from "zod";
import * as schema from "../db/schema";
import { insertUserSchema, users, verificationTokens } from "../db/schema";
import { DRIZZLE_ORM } from "../drizzle/constants";
import { User } from "../entities/user.entity";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE_ORM) private db: MySql2Database<typeof schema>,
    private mailService: MailService,
  ) {}

  async create(createUserDto: z.infer<typeof insertUserSchema>) {
    const { password, name, email } = createUserDto;
    const hashedPassword = await argon2.hash(password);
    const userId = nanoid();

    const newUser = {
      id: userId,
      name: name,
      email: email,
      hashedPassword,
    };

    await this.db.insert(users).values(newUser);

    const [createdUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    const token = nanoid();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await this.db.insert(verificationTokens).values({
      id: nanoid(),
      token,
      userId: createdUser.id,
      expiresAt,
      used: false,
    });

    const userEntity = new User(createdUser);
    await this.mailService.sendVerificationEmail(userEntity, token);

    return {
      message: "User created. Please check your email to verify your account.",
    };
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user ? new User(user) : null;
  }

  async findOneById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user ? new User(user) : null;
  }

  async setUserAsVerified(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, userId));
  }
}
