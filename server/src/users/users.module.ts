import { Module } from "@nestjs/common";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { MailModule } from "../mail/mail.module";
import { UsersService } from "./users.service";

@Module({
  imports: [DrizzleModule, MailModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
