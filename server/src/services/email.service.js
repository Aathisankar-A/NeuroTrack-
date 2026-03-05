import { env } from '../config/env.js';

/**
 * Service for sending emails.
 * Placeholder implementation using console.log for now.
 * In production, this would use Nodemailer or a service like Resend/SendGrid.
 */
class EmailService {
    static async sendResetPasswordEmail(to, token) {
        const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

        console.log(`
      📧 [EMAIL SERVICE] Reset Password Link
      To: ${to}
      URL: ${resetUrl}
    `);

        // Actual implementation would go here:
        // await resend.emails.send({ ... });
    }
}

export default EmailService;
