import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards, UsePipes } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { loginUserSchema, registerUserSchema } from "../db/schema.js";
import { UsersService } from "../users/users.service.js";
import { AuthService } from "./auth.service.js";
import { ZodValidationPipe } from "./pipes/zod-validation.pipe.js";



@ApiTags("auth")
@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Post("register")
  @UsePipes(new ZodValidationPipe(registerUserSchema))
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully created." })
  async register(@Body() registerUserDto: z.infer<typeof registerUserSchema>) {
    return this.usersService.create(registerUserDto);
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
  async login(@Request() req) {
    console.log("🚀 ~ AuthController ~ login ~ req.user:", req.user)
    // req.user is populated by the LocalStrategy guard
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard("jwt-refresh"))
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refreshes the access token" })
  @ApiBearerAuth("jwt-refresh-token")
  @ApiResponse({
    status: 200,
    description: "Returns new access and refresh tokens.",
  })
  async refresh(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  @ApiOperation({ summary: "Gets the user profile" })
  @ApiBearerAuth("jwt-access-token")
  @ApiResponse({ status: 200, description: "Returns user profile." })
  getProfile(@Request() req) {
    return req.user;
  }
}
