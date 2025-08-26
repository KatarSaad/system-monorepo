import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { MetricsService } from '@katarsaad/monitoring';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private metricsService: MetricsService
  ) {
    this.initializeMetrics();
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      this.metricsService.incrementCounter('rbac_check_failed', 1, { reason: 'no_user' });
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (hasRole) {
      this.metricsService.incrementCounter('rbac_check_success', 1, { role: user.role });
      return true;
    } else {
      this.metricsService.incrementCounter('rbac_check_failed', 1, { 
        reason: 'insufficient_role',
        userRole: user.role,
        requiredRoles: requiredRoles.join(',')
      });
      throw new ForbiddenException(`Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`);
    }
  }

  private initializeMetrics() {
    this.metricsService.createCounter('rbac_check_success', 'Successful RBAC checks');
    this.metricsService.createCounter('rbac_check_failed', 'Failed RBAC checks');
  }
}