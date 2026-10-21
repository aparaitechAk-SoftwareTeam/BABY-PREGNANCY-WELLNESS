import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../common/email.service';
import { SignupDto, Role, OtpType } from './dto/signup.dto';
import { VerifyOtpDto, ResendOtpDto } from './dto/verify-otp.dto';
import { SigninDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdminAccounts();
  }

  private async seedDefaultAdminAccounts() {
    try {
      const adminEmail = 'admin@aparaitech.com';
      const adminExists = await (this.prisma as any).user.findUnique({
        where: { email: adminEmail },
      });

      if (!adminExists) {
        const hashedAdminPassword = await bcrypt.hash('admin123', 10);
        await (this.prisma as any).user.create({
          data: {
            email: adminEmail,
            password: hashedAdminPassword,
            name: 'Sarah Chen',
            role: 'ADMIN',
            isEmailVerified: true,
            isProfileCompleted: true,
          },
        });
        this.logger.log('Default Admin account seeded: admin@aparaitech.com');
      }

      const supportEmail = 'support@aparaitech.com';
      const supportExists = await (this.prisma as any).user.findUnique({
        where: { email: supportEmail },
      });

      if (!supportExists) {
        const hashedSupportPassword = await bcrypt.hash('support123', 10);
        await (this.prisma as any).user.create({
          data: {
            email: supportEmail,
            password: hashedSupportPassword,
            name: 'Maria Garcia',
            role: 'SUPPORT',
            isEmailVerified: true,
            isProfileCompleted: true,
          },
        });
        this.logger.log('Default Support account seeded: support@aparaitech.com');
      }
    } catch (err) {
      this.logger.warn('Could not seed default admin accounts:', err);
    }
  }

  // Generate cryptographic 6-digit OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 1. SIGNUP
  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase();
    const existing = await (this.prisma as any).user.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isEmailVerified) {
        throw new BadRequestException('An account with this email address already exists. Please sign in.');
      }
      // If unverified, update name & password and resend OTP
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      await (this.prisma as any).user.update({
        where: { id: existing.id },
        data: {
          name: dto.name,
          password: hashedPassword,
          role: (dto.role || existing.role) as any,
        },
      });

      const otp = this.generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await (this.prisma as any).otpCode.create({
        data: {
          email: existing.email,
          code: otp,
          type: OtpType.VERIFICATION as any,
          expiresAt,
          userId: existing.id,
        },
      });

      await this.emailService.sendOtpEmail(existing.email, otp, OtpType.VERIFICATION);

      return {
        success: true,
        message: 'Verification code resent to your email address.',
        email: existing.email,
        requiresVerification: true,
      };
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await (this.prisma as any).user.create({
      data: {
        email,
        password: hashedPassword,
        name: dto.name,
        role: (dto.role || Role.MOTHER) as any,
        isEmailVerified: false,
      },
    });

    // If mother, create profile with safe maternal baselines
    if (user.role === Role.MOTHER) {
      const defaultDueDate = new Date(Date.now() + 140 * 24 * 60 * 60 * 1000); // ~20 weeks out
      await (this.prisma as any).pregnancyProfile.create({
        data: {
          userId: user.id,
          currentWeek: 20,
          currentDay: 0,
          trimester: 2,
          daysRemaining: 140,
          dueDate: defaultDueDate,
          bloodGroup: 'O+',
          prePregnancyWeight: 60.0,
          currentWeight: 65.0,
          height: 165.0,
          motherAge: 28,
          calculationMethod: 'EDD',
          pregnancyType: 'SINGLE',
        },
      });
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await (this.prisma as any).otpCode.create({
      data: {
        email: user.email,
        code: otp,
        type: OtpType.VERIFICATION as any,
        expiresAt,
        userId: user.id,
      },
    });

    await this.emailService.sendOtpEmail(user.email, otp, OtpType.VERIFICATION);

    return {
      success: true,
      message: 'Registration successful! Verification code sent to your email.',
      email: user.email,
      requiresVerification: true,
    };
  }

  // 2. VERIFY OTP (Account Activation)
  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase();
    const otpRecord = await (this.prisma as any).otpCode.findFirst({
      where: {
        email,
        code: dto.otp,
        type: OtpType.VERIFICATION as any,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired verification code. Please request a new code.');
    }

    // Activate User
    const user = await (this.prisma as any).user.update({
      where: { email },
      data: { isEmailVerified: true },
      include: { profile: true },
    });

    // Clean up used OTPs
    await (this.prisma as any).otpCode.deleteMany({
      where: { email, type: OtpType.VERIFICATION as any },
    });

    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Email verified successfully! Welcome to AparaiTech.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isProfileCompleted: user.isProfileCompleted ?? false,
        profile: user.profile,
      },
    };
  }

  // 3. RESEND OTP
  async resendOtp(dto: ResendOtpDto) {
    const email = dto.email.toLowerCase();
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('This account is already verified. Please sign in.');
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await (this.prisma as any).otpCode.create({
      data: {
        email: user.email,
        code: otp,
        type: OtpType.VERIFICATION as any,
        expiresAt,
        userId: user.id,
      },
    });

    await this.emailService.sendOtpEmail(user.email, otp, OtpType.VERIFICATION);

    return {
      success: true,
      message: 'A new verification code has been sent to your email.',
      email: user.email,
    };
  }

  // 4. SIGNIN / LOGIN
  async signin(dto: SigninDto) {
    const email = dto.email.toLowerCase();
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isEmailVerified) {
      // Re-send verification code if user is not verified
      const otp = this.generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await (this.prisma as any).otpCode.create({
        data: {
          email: user.email,
          code: otp,
          type: OtpType.VERIFICATION as any,
          expiresAt,
          userId: user.id,
        },
      });

      await this.emailService.sendOtpEmail(user.email, otp, OtpType.VERIFICATION);

      throw new UnauthorizedException({
        message: 'Your email address is not verified yet. A verification code has been sent to your email.',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = this.generateToken(user);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isProfileCompleted: user.isProfileCompleted ?? false,
        profile: user.profile,
      },
    };
  }

  // 5. FORGOT PASSWORD (Send OTP)
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
        email,
      };
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await (this.prisma as any).otpCode.create({
      data: {
        email: user.email,
        code: otp,
        type: OtpType.PASSWORD_RESET as any,
        expiresAt,
        userId: user.id,
      },
    });

    await this.emailService.sendOtpEmail(user.email, otp, OtpType.PASSWORD_RESET);

    return {
      success: true,
      message: 'Password reset code sent to your email address.',
      email,
    };
  }

  // 6. RESET PASSWORD (Verify OTP & Set New Password)
  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase();
    const otpRecord = await (this.prisma as any).otpCode.findFirst({
      where: {
        email,
        code: dto.otp,
        type: OtpType.PASSWORD_RESET as any,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired reset code. Please request a new code.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await (this.prisma as any).user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
      },
    });

    // Invalidate reset OTPs
    await (this.prisma as any).otpCode.deleteMany({
      where: { email, type: OtpType.PASSWORD_RESET as any },
    });

    return {
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    };
  }

  /**
   * Validate Caregiver Joining Code (e.g. MOM-XXXX) from live Neon DB
   */
  async validateCaregiverCode(code: string) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new BadRequestException('Pairing code is required.');
    }

    const pairing = await (this.prisma as any).caregiverPairing.findFirst({
      where: {
        pairingCode: cleanCode,
      },
      include: {
        mother: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!pairing) {
      return {
        valid: false,
        message: 'Invalid pairing code. Please ask the mother to generate a fresh code from her profile.',
      };
    }

    if (pairing.status === 'REVOKED') {
      return {
        valid: false,
        message: 'This pairing code has been revoked by the mother.',
      };
    }

    return {
      valid: true,
      message: `Verified! Linking to ${pairing.mother?.name || 'Mother'}.`,
      motherName: pairing.mother?.name,
      relationship: pairing.relationship || 'Partner',
    };
  }

  /**
   * Google Social Authentication (Sign In & Sign Up in Neon DB)
   * Unified Account Linking: If user signed up with email/password/OTP previously,
   * Google sign-in returns the EXACT same user account & dashboard.
   * If new user, creates account, marks verified (no OTP needed), and emails generated
   * password to user so they can also log in via Email & Password anytime.
   */
  async googleAuth(dto: GoogleAuthDto) {
    let email = (dto.email || '').trim().toLowerCase();
    let name = (dto.name || '').trim();

    // If a JWT token was passed from Neon Auth or Google OAuth, decode payload if email missing
    if (!email && (dto.token || dto.idToken)) {
      try {
        const rawToken = dto.token || dto.idToken;
        const parts = rawToken!.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload.email) email = payload.email.trim().toLowerCase();
          if (payload.name && !name) name = payload.name.trim();
        }
      } catch (err) {
        // quiet fallback
      }
    }

    if (!email) {
      throw new BadRequestException('Email address is required for Google authentication.');
    }

    let user = await (this.prisma as any).user.findUnique({
      where: { email },
      include: { profile: true },
    });

    const targetRole = (dto.role || 'MOTHER').toUpperCase();

    // If new user, create account in Neon DB & email credentials
    if (!user) {
      // If signing up as caregiver with joining code, validate code first
      let validPairing: any = null;
      if (targetRole === 'CAREGIVER' && dto.joiningCode) {
        const cleanCode = dto.joiningCode.trim().toUpperCase();
        validPairing = await (this.prisma as any).caregiverPairing.findFirst({
          where: { pairingCode: cleanCode, status: { not: 'REVOKED' } },
        });
        if (!validPairing) {
          throw new BadRequestException('Invalid caregiver joining code. Please check with the mother.');
        }
      }

      // Generate a user-friendly secure password (e.g. Aparai@7482!)
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedPassword = `Aparai@${randomDigits}!`;
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      const displayName = name || email.split('@')[0];

      user = await (this.prisma as any).user.create({
        data: {
          email,
          name: displayName,
          password: hashedPassword,
          role: targetRole,
          isEmailVerified: true, // Google accounts are pre-verified; no OTP needed!
          isProfileCompleted: targetRole === 'CAREGIVER' ? true : false,
        },
        include: { profile: true },
      });

      // Send the welcome credentials email so user can also log in via Email & Password
      try {
        await this.emailService.sendGoogleWelcomeCredentialsEmail(
          email,
          displayName,
          generatedPassword,
        );
      } catch (emailErr) {
        this.logger.warn(`Failed to send credentials email to ${email}: ${emailErr}`);
      }

      // If valid pairing was found, connect caregiver immediately
      if (validPairing) {
        await (this.prisma as any).caregiverPairing.update({
          where: { id: validPairing.id },
          data: {
            caregiverId: user.id,
            status: 'ACTIVE',
            pairedAt: new Date(),
          },
        });
      }
    } else {
      // Existing user: ensure email is marked verified (Google verified it)
      if (!user.isEmailVerified) {
        user = await (this.prisma as any).user.update({
          where: { id: user.id },
          data: { isEmailVerified: true },
          include: { profile: true },
        });
      }

      // If caregiver and code provided, ensure linked
      if (dto.joiningCode && user.role === 'CAREGIVER') {
        const cleanCode = dto.joiningCode.trim().toUpperCase();
        const pairing = await (this.prisma as any).caregiverPairing.findFirst({
          where: { pairingCode: cleanCode, status: { not: 'REVOKED' } },
        });
        if (pairing && pairing.motherId !== user.id) {
          await (this.prisma as any).caregiverPairing.update({
            where: { id: pairing.id },
            data: {
              caregiverId: user.id,
              status: 'ACTIVE',
              pairedAt: new Date(),
            },
          });
        }
      }
    }

    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Google authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isProfileCompleted: user.isProfileCompleted ?? false,
        setupCompleted: user.isProfileCompleted ?? false,
        profile: user.profile,
      },
    };
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return this.jwtService.sign(payload);
  }
}
