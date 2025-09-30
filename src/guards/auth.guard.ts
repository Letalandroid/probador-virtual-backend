import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Token no proporcionado o formato inválido.',
      );
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = this.jwtService.verify(token);
      req.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException({
        message: 'Token inválido o expirado.',
        error: err.message,
      });
    }
  }
}
