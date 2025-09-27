import { Reflector } from '@nestjs/core';

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { User } from '../interfaces';
import { Request } from 'express';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //Obtenemos los roles especificados por la metadata en el controller
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req: Request = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new BadRequestException('User not found');
    }

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new UnauthorizedException(
      `User ${user.fullName} need a valid role: ${JSON.stringify(validRoles)}`,
    );
  }
}
