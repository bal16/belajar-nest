import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];

    if (token) {
      const user = await this.prismaService.user.findFirst({
        where: {
          token,
        },
      });

      if (user) {
        req['user'] = user;
      }
    }

    next();
  }
}
