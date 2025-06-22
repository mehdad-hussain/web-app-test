import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DrizzleModule } from "../drizzle/drizzle.module.js";
import { UsersModule } from "../users/users.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { RefreshTokenStrategy } from "./strategies/jwt-refresh.strategy.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";
import { LocalStrategy } from "./strategies/local.strategy.js";

@Module({
  imports: [
    UsersModule,
    DrizzleModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
