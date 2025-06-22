import { Module } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { DrizzleModule } from "../drizzle/drizzle.module.js";
import { MailModule } from "../mail/mail.module.js";

@Module({
  imports: [DrizzleModule, MailModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
