import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AppService } from "./app.service.js";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/api/getTest")
  getTest(@Query() query: any) {
    return query;
  }

  @Post("/api/postTest")
  postTest(@Body() body: any) {
    return { hello: "world" };
  }

  @Get("/api/hello")
  getHello() {
    return this.appService.getHello();
  }
}
