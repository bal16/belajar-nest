import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@common/prisma.service';
import { ValidationService } from '@common/validation.service';
import { RegisterUserRequest, UserResponse } from 'src/model/user.model';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}
  async register(req: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`register new user ${JSON.stringify(req)}`);
    const registerReq = this.validationService.validate(
      UserValidation.REGISTER,
      req,
    );

    const userWithSameUsername = await this.prismaService.user.count({
      where: {
        username: registerReq.username,
      },
    });

    if (userWithSameUsername > 0) {
      throw new HttpException('Username already exists', 400);
    }

    req.password = await bcrypt.hash(req.password, 10);

    const user = await this.prismaService.user.create({
      data: req,
    });
    return {
      username: user.username,
      name: user.name,
    };
  }
}
