import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { PrismaService } from '@katarsaad/system-module';
import { CacheService } from '@katarsaad/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Check cache first
      const cachedSession = await this.cacheService.get(`session:${token}`);
      if (cachedSession.isSuccess && cachedSession.value) {
        const sessionData = cachedSession.value as any;
        const user = await this.prisma.user.findUnique({
          where: { id: sessionData.userId },
        });

        if (user && user.isActive) {
          request.user = user;
          return true;
        }
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);

      // Get session from database
      const session = await this.prisma.session.findUnique({
        where: {
          accessToken: token,
          isActive: true,
        },
        include: { user: true },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found or expired');
      }

      if (!session.user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      // Verify token version matches user version
      if (payload.version !== session.user.version) {
        throw new UnauthorizedException('Token version mismatch');
      }

      // Cache the session
      await this.cacheService.set(
        `session:${token}`,
        {
          userId: session.user.id,
          sessionId: session.id,
        },
        { ttl: 300 }, // Cache for 5 minutes,
      );

      request.user = session.user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
