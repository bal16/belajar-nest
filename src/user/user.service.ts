import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@common/prisma.service';
import { ValidationService } from '@common/validation.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from 'src/model/user.model';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}
  async register(req: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`userService.register (${JSON.stringify(req)})`);
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

  async login(req: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`userService.login (${JSON.stringify(req)})`);

    const loginReq = this.validationService.validate(UserValidation.LOGIN, req);

    let user = await this.prismaService.user.findUnique({
      where: {
        username: loginReq.username,
      },
    });

    if (!user) throw new HttpException('Credentials is invalid', 401);

    const isPasswordValid = await bcrypt.compare(
      loginReq.password,
      user.password,
    );

    if (!isPasswordValid)
      throw new HttpException('Credentials is invalid', 401);

    user = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: {
        token: uuid(),
      },
    });

    return {
      username: user.username,
      name: user.name,
      token: user.token,
    };
  }

  async get(user: User): Promise<UserResponse> {
    return {
      username: user.username,
      name: user.name,
    };
  }
}
