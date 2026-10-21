import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendOtpEmail(toEmail: string, otpCode: string, type: 'VERIFICATION' | 'PASSWORD_RESET') {
    const isVerification = type === 'VERIFICATION';
    const subject = isVerification
      ? 'Verify your AparaiTech Pregnancy Wellness Account'
      : 'Reset your AparaiTech Password';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background-color: #FFFFFF; border: 1px solid #F1F5F9; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #E11D48; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">AparaiTech Maternal Care</h2>
          <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Baby Pregnancy & Wellness Platform</p>
        </div>
        
        <p style="color: #334155; font-size: 14px; line-height: 22px; margin-bottom: 20px;">
          ${
            isVerification
              ? 'Welcome to AparaiTech! Please enter the 6-digit verification code below to verify your email address and activate your account:'
              : 'We received a request to reset your AparaiTech account password. Use the 6-digit verification code below to proceed:'
          }
        </p>
        
        <div style="background-color: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #E11D48; font-family: monospace;">${otpCode}</span>
        </div>
        
        <p style="color: #64748B; font-size: 12px; line-height: 18px; margin-top: 20px; text-align: center;">
          This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
        </p>
        
        <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          If you did not request this email, you can safely ignore it.
        </p>
      </div>
    `;

    // Always log OTP in server console for instant testing & development visibility
    this.logger.log(`\n========================================\n[EMAIL OTP] To: ${toEmail}\n[TYPE]: ${type}\n[CODE]: ${otpCode}\n========================================`);

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.EMAIL_FROM || 'krushnarathod.aparaitech@gmail.com';

    if (!apiKey) {
      this.logger.warn('BREVO_API_KEY is not configured in .env. OTP was printed to console.');
      return { success: true, deliveredVia: 'console' };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          sender: { name: 'AparaiTech Care', email: 'krushnarathod.aparaitech@gmail.com' },
          to: [{ email: toEmail }],
          subject,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Brevo Email API error: ${errorData}`);
        return { success: false, error: errorData, deliveredVia: 'console' };
      }

      this.logger.log(`Brevo Email successfully delivered to: ${toEmail}`);
      return { success: true, deliveredVia: 'brevo' };
    } catch (err: any) {
      this.logger.error(`Brevo delivery failed: ${err.message}`);
      return { success: false, error: err.message, deliveredVia: 'console' };
    }
  }

  /**
   * Send Welcome Credentials Email for Google Social Signup
   * Allows user to sign in using Email & Password as an alternative to Google without OTP
   */
  async sendGoogleWelcomeCredentialsEmail(toEmail: string, name: string, generatedPassword: string) {
    const appName = 'Aparaitech-wellness';
    const subject = `Welcome to ${appName} - Your Account Credentials`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #E11D48; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${appName}</h2>
          <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Maternal Care, Baby & Pregnancy Wellness Platform</p>
        </div>
        
        <p style="color: #1E293B; font-size: 15px; line-height: 24px; margin-bottom: 16px;">
          Hi <strong>${name || 'there'}</strong>,
        </p>

        <p style="color: #334155; font-size: 14px; line-height: 22px; margin-bottom: 20px;">
          Welcome to <strong>${appName}</strong>! Your account has been verified and activated via Google Sign-In. You do <strong>not</strong> need to verify any OTP code.
        </p>

        <p style="color: #334155; font-size: 14px; line-height: 22px; margin-bottom: 16px;">
          To ensure you can always access your account—even when signing in with email and password instead of Google—we have generated your account login credentials:
        </p>
        
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-size: 13px; width: 120px;">Email / Username:</td>
              <td style="padding: 6px 0; color: #0F172A; font-size: 14px; font-weight: 600;">${toEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-size: 13px;">Login Password:</td>
              <td style="padding: 6px 0; color: #E11D48; font-size: 15px; font-weight: 700; font-family: monospace;">${generatedPassword}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748B; font-size: 13px;">Login Options:</td>
              <td style="padding: 6px 0; color: #059669; font-size: 13px; font-weight: 600;">Google Sign-In OR Email & Password</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #64748B; font-size: 12px; line-height: 18px; margin-top: 20px;">
          💡 <strong>Tip:</strong> You can use these credentials to sign in directly on any device without waiting for OTP codes. You can also change your password at any time in your profile settings.
        </p>
        
        <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          ${appName} • Automated Security Notification
        </p>
      </div>
    `;

    this.logger.log(`\n========================================\n[GOOGLE SIGNUP CREDENTIALS]\nTo: ${toEmail}\nPassword: ${generatedPassword}\n========================================`);

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      this.logger.warn('BREVO_API_KEY is not configured in .env. Password was printed to console.');
      return { success: true, deliveredVia: 'console' };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          sender: { name: appName, email: 'krushnarathod.aparaitech@gmail.com' },
          to: [{ email: toEmail, name }],
          subject,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`Brevo Email API error sending credentials: ${errorData}`);
        return { success: false, error: errorData, deliveredVia: 'console' };
      }

      this.logger.log(`Credentials email successfully delivered to: ${toEmail}`);
      return { success: true, deliveredVia: 'brevo' };
    } catch (err: any) {
      this.logger.error(`Brevo delivery failed for credentials: ${err.message}`);
      return { success: false, error: err.message, deliveredVia: 'console' };
    }
  }
}
