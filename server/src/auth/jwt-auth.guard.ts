import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify as jwtVerify } from 'jsonwebtoken';
import { AppRole } from '@packtrack/shared';

interface JwtPayload {
  sub: string;
  username: string;
  role: AppRole;
  type: 'access' | 'refresh';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: JwtPayload }>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization header.');
    }

    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      throw new UnauthorizedException('Authorization header must be Bearer token.');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException('JWT secret is not configured.');
    }

    let payload: unknown;
    try {
      payload = jwtVerify(match[1], secret);
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    if (!payload || typeof payload !== 'object') {
      throw new UnauthorizedException('Invalid token payload.');
    }

    const parsed = payload as Partial<JwtPayload>;
    if (!parsed.sub || !parsed.username || !parsed.role || parsed.type !== 'access') {
      throw new UnauthorizedException('Invalid token payload.');
    }

    request.user = parsed as JwtPayload;
    return true;
  }
}
