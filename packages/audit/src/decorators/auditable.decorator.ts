import { AuditService } from '../services/audit.service';

export function Auditable(action: string, resource: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const auditService: AuditService = (this as any).auditService || (globalThis as any).auditService;
      const request = args.find(arg => arg?.user || arg?.ip);
      
      const oldValues = args[1];
      const result = await originalMethod.apply(this, args);
      const newValues = result;

      if (auditService && request?.user) {
        await auditService.log({
          userId: request.user.id,
          action,
          resource,
          resourceId: args[0]?.id || args[0] || 'unknown',
          oldValues,
          newValues,
          ipAddress: request.ip,
          userAgent: request.headers?.['user-agent'],
          timestamp: new Date()
        });
      }

      return result;
    };

    return descriptor;
  };
}