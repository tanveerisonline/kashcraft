// src/lib/services/email/email.factory.ts

import { IEmailService, EmailProvider } from "./email.interface";
import { SendGridEmailService } from "./sendgrid.service";
// import { AwsSesEmailService } from "./aws-ses.service"; // Future implementation
// import { ResendEmailService } from "./resend.service"; // Future implementation

export class EmailServiceFactory {
  static create(provider: EmailProvider): IEmailService {
    switch (provider) {
      case EmailProvider.SENDGRID:
        return new SendGridEmailService();
      // case EmailProvider.AWS_SES:
      //   return new AwsSesEmailService();
      // case EmailProvider.RESEND:
      //   return new ResendEmailService();
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }
  }
}
