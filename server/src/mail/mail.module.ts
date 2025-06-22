import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter.js";
import { Module } from "@nestjs/common";
import path from "path";
import { env } from "../lib/env.js";
import { MailService } from "./mail.service.js";

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: "smtp.resend.com",
                secure: true,
                auth: {
                    user: "resend",
                    pass: env.RESEND_API_KEY,
                },
            },
            defaults: {
                from: `<${env.MAIL_FROM}>`,
            },
            template: {
                dir: path.join(process.cwd(), 'src', 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {} 