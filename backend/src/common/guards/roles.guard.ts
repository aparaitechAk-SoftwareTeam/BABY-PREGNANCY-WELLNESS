import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Access denied: You do not possess the required staff role permissions.',
      );
    }

    const userRole = String(user.role).toUpperCase();
    const normalizedRequired = requiredRoles.map((r) => r.toUpperCase());

    const hasRole = normalizedRequired.includes(userRole);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Required privileges (${normalizedRequired.join(', ')}). Your role: ${userRole}. Support agents only have access to the Support Console.`,
      );
    }

    return true;
  }
}
