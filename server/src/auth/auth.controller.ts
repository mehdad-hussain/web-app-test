import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Request, Res, UseGuards, UsePipes } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { z } from "zod";
import { AccessTokenGuard } from "../common/guards/accessToken.guard";
import { RefreshTokenGuard } from "../common/guards/refreshToken.guard";
import { insertUserSchema, loginUserSchema } from "../db/schema";
import { env } from "../lib/env";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "./pipes/zod-validation.pipe";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService
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
    const { accessToken, refreshToken, expires } = await this.authService.login(req.user, req);

    response.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV !== "development",
      sameSite: "strict",
      path: "/",
      expires,
    });

    return { accessToken };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logs the user out" })
  @ApiResponse({ status: 200, description: "Logout successful." })
  async logout(@Request() req, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      try {
        // Decode the refresh token to get user ID
        const decoded = this.jwtService.decode(refreshToken) as { sub: string };
        if (decoded?.sub) {
          await this.authService.logout(decoded.sub, refreshToken);
        }
      } catch (error) {
        // If token is invalid, just clear the cookie
        console.log('Invalid refresh token during logout');
      }
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

  @UseGuards(RefreshTokenGuard)
  @Get("sessions")
  @ApiOperation({ summary: "Gets all active sessions for the user" })
  @ApiBearerAuth("jwt-refresh")
  @ApiResponse({ status: 200, description: "Returns a list of active sessions." })
  async getSessions(@Request() req) {
    const { sub, refreshToken } = req.user;
    return this.authService.getCurrentSession(sub, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Post("sessions/revoke")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revokes a specific session" })
  @ApiBody({
      schema: {
        type: "object",
        properties: {
          sessionToken: { type: "string" },
        },
        required: ['sessionToken'],
      },
  })
  @ApiBearerAuth("jwt")
  @ApiResponse({ status: 200, description: "Session revoked successfully." })
  async revokeSession(@Request() req, @Body('sessionToken') sessionToken: string) {
      if (!sessionToken) {
          throw new BadRequestException('sessionToken is required.');
      }
      await this.authService.revokeSession(req.user.sub, sessionToken);
      return { message: "Session revoked successfully" };
  }
}
