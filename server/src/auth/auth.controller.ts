import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Res, UseGuards, UsePipes, Query } from "@nestjs/common";
import { z } from "zod";
import { loginUserSchema, insertUserSchema } from "../db/schema.js";
import { UsersService } from "../users/users.service.js";
import { AuthService } from "./auth.service.js";
import { ZodValidationPipe } from "./pipes/zod-validation.pipe.js";
import { Response } from "express";
import { env } from "../lib/env.js";
import { AuthGuard } from "@nestjs/passport";
import { AccessTokenGuard } from "../common/guards/accessToken.guard.js";
import { RefreshTokenGuard } from "../common/guards/refreshToken.guard.js";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Post("register")
  @UsePipes(new ZodValidationPipe(insertUserSchema))
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully created." })
  async register(@Body() registerUserDto: z.infer<typeof insertUserSchema>) {
    return this.usersService.create(registerUserDto);
  }

  @Get("verify-email")
  @ApiOperation({ summary: "Verify user email" })
  @ApiResponse({ status: 200, description: "Email successfully verified." })
  @ApiResponse({ status: 401, description: "Invalid or expired token." })
  async verifyEmail(@Query("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(AuthGuard("local"))
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginUserSchema))
  @ApiOperation({ summary: "Logs the user in" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "test@example.com" },
        password: { type: "string", example: "password123" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Login successful, returns tokens.",
  })
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.login(req.user);

    const expires = new Date(Date.now() + 1 * 60 * 1000); // For testing: 1 minute

    response.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
      expires,
    });

    return { accessToken: tokens.accessToken };
  }

  @UseGuards(AccessTokenGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logs the user out" })
  @ApiBearerAuth("jwt")
  @ApiResponse({ status: 200, description: "Logout successful." })
  async logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    response.clearCookie("refresh_token");
    return { message: "Logout successful" };
  }

  @UseGuards(AccessTokenGuard)
  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logs the user out from all devices" })
  @ApiBearerAuth("jwt")
  @ApiResponse({ status: 200, description: "Logout from all devices successful." })
  async logoutAll(@Request() req, @Res({ passthrough: true }) response: Response) {
    await this.authService.logoutAll(req.user.sub);
    response.clearCookie("refresh_token");
    return { message: "Logout from all devices successful" };
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refreshes the access token" })
  @ApiBearerAuth("jwt-refresh")
  @ApiResponse({
    status: 200,
    description: "Returns a new access token.",
  })
  async refresh(@Request() req) {
    const { sub, refreshToken, email } = req.user;
    return this.authService.refreshTokens(sub, refreshToken, email);
  }

  @UseGuards(AccessTokenGuard)
  @Get("profile")
  @ApiOperation({ summary: "Gets the user profile" })
  @ApiBearerAuth("jwt")
  @ApiResponse({ status: 200, description: "Returns user profile." })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AccessTokenGuard)
  @Get("sessions")
  @ApiOperation({ summary: "Gets all active sessions for the user" })
  @ApiBearerAuth("jwt")
  @ApiResponse({ status: 200, description: "Returns a list of active sessions." })
  async getSessions(@Request() req) {
    return this.authService.getSessions(req.user.sub);
  }
}
