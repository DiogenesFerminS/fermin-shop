import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

import { User } from '../interfaces/user.interface';

export const GetUser = createParamDecorator(
  (data: keyof User, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    return !data ? user : user[data];
  },
);
