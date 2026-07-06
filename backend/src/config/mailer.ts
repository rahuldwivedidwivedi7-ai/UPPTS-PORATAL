import nodemailer from 'nodemailer';
import { env } from './env.js';

// Setup email SMTP transport
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: env.SMTP_USER && env.SMTP_PASS ? {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  } : undefined,
});

export const mailer = {
  /**
   * Send mail service wrapper
   */
  async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      const info = await transporter.sendMail({
        from: `\"UP Police Tech Services\" <${env.SMTP_FROM}>`,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`✉️ Email notification sent to ${to}: MessageID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      // Fail silently in development/staging if SMTP not working properly, do not crash the system.
      return false;
    }
  }
};
export default mailer;
