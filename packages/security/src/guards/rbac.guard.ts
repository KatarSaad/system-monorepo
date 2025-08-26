import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MetricsService } from '@katarsaad/monitoring';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private metrics: MetricsService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.metrics.incrementCounter('rbac_denied', 1, { reason: 'no_user' });
      return false;
    }

    const hasRole = requiredRoles.some(role => user.roles?.includes(role));
    
    if (!hasRole) {
      this.metrics.incrementCounter('rbac_denied', 1, { reason: 'insufficient_role' });
    } else {
      this.metrics.incrementCounter('rbac_allowed', 1);
    }

    return hasRole;
  }
}