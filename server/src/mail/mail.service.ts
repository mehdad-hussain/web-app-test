import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { env } from "../lib/env";

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendVerificationEmail(user: User, token: string) {
        const verificationUrl = `${env.CORS_ORIGIN}/verify-email?token=${token}`;
        
        await this.mailerService.sendMail({
            to: user.email,
            from: `<${env.MAIL_FROM}>`,
            subject: "Verify your email address for Venturas",
            template: "verification-email", // name of the Handlebars file
            context: {
                name: user.name,
                url: verificationUrl,
            },
        });
    }
} 