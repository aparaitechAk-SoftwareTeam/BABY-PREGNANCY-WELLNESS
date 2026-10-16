import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader) {
      const [scheme, token] = authHeader.split(' ');
      if (scheme === 'Bearer' && token) {
        try {
          const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET || 'aparaitech-pregnancy-wellness-secret-key-2026',
          });
          request.user = payload;
          return true;
        } catch {
          // Token expired or invalid, check fallback
        }
      }
    }

    // Fallback: If request body contains userId or email, allow onboarding setup to proceed
    if (request.body?.userId || request.body?.email) {
      request.user = {
        sub: request.body.userId,
        email: request.body.email,
      };
      return true;
    }

    throw new UnauthorizedException('Authentication required to access this endpoint');
  }
}
