import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import constants from './constants';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { UserService } from '../user/user.service';
import { IS_REFRESH_KEY } from './decorators/refresh.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isRefresh = this.reflector.getAllAndOverride<boolean>(
      IS_REFRESH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({ success: false });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: isRefresh
          ? constants.JWT_REFRESH_SECRET
          : constants.JWT_ACCESS_SECRET,
      });
      const { _id } = payload;
      const user = await this.userService.profile(_id);

      if (!user) {
        throw new UnauthorizedException({ message: 'Denied!', success: false });
      }

      request.body.payload = user;
    } catch {
      throw new UnauthorizedException({ success: 'false' });
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
