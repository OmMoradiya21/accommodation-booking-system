import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorator/skipJwtAccessAuthGuard.decorator.ts';
import { Roles } from '../decorator/roles.decorator.ts';
import { PERMISSIONS_KEY } from '../decorator/permissions.decorator.ts';
import { User } from '../../users/entities/user.entity.ts';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const currentUser = request.user;
    if (!currentUser) {
      throw new UnauthorizedException('Authentication required');
    }

    const userId = currentUser.sub || currentUser.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid user token');
    }

    // Read user's permissions and role directly from database
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: { role: true, permissions: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found in database');
    }

    // Dynamic Database Permissions check
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = new Set<string>([
        ...(user.permissions?.map((p) => p.name) || []),
        ...(user.role?.permissions || []),
      ]);

      const hasPermissions = requiredPermissions.every((permission) =>
        userPermissions.has(permission),
      );

      if (!hasPermissions) {
        throw new ForbiddenException(
          `Access denied: Missing required permission (${requiredPermissions.join(', ')})`,
        );
      }
    }

    // Role check if specified
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = user.role?.name || currentUser.role;
      const hasRole = requiredRoles.includes(userRole);
      if (!hasRole) {
        throw new ForbiddenException(
          `Access denied: Required role (${requiredRoles.join(', ')})`,
        );
      }
    }

    return true;
  }
}
