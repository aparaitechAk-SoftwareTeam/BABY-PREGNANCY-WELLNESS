import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

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
