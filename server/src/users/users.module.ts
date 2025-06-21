import { Module } from "@nestjs/common";
import { DrizzleModule } from "../drizzle/drizzle.module.js";
import { UsersService } from "./users.service.js";

@Module({
  imports: [DrizzleModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
