import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { env } from "./lib/env";
import { MailModule } from "./mail/mail.module";
import { MurmursModule } from "./murmurs/murmurs.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: env.NODE_ENV !== "production" ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            // singleLine: true,
            ignore: 'pid,hostname,context',
            translateTime: 'HH:MM:ss',
          }
        } : undefined,
        level: env.NODE_ENV !== "production" ? "debug" : "info",
        // Customize logged properties
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["sec-ch-ua"]',
          'req.headers["sec-fetch-site"]',
          'req.headers["sec-fetch-mode"]',
          'req.headers["sec-fetch-dest"]',
          'req.headers["accept-encoding"]',
          'req.headers["accept-language"]',
          'req.headers["sec-ch-ua-mobile"]',
          'req.headers["sec-ch-ua-platform"]',
          'res.headers["x-powered-by"]',
          'res.headers["access-control-allow-credentials"]',
          'res.headers["access-control-allow-origin"]',
          'res.headers["vary"]',
          'res.headers["etag"]',
        ],
        customProps: (req) => ({
          headers: {
            'content-type': req.headers['content-type'],
            'user-agent': req.headers['user-agent'],
            'referer': req.headers['referer'],
          }
        }),
        serializers: {
          req(request) {
            return {
              method: request.method,
              url: request.url,
              params: request.params,
              body: request.raw.body // Include request body
            };
          },
          res(response) {
            return {
              statusCode: response.statusCode,
              body: response.raw.body // Include response body
            };
          },
          err(error) {
            return {
              type: error.type,
              message: error.message,
              stack: error.stack,
              // Include any custom error properties
              ...(error.response && { response: error.response }),
              ...(error.status && { status: error.status })
            };
          }
        }
      },
    }),
    DrizzleModule,
    UsersModule,
    AuthModule,
    MailModule,
    MurmursModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
