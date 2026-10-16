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
}
