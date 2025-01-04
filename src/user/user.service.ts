import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '@common/prisma.service';
import { ValidationService } from '@common/validation.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
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
    this.logger.debug(`userService.register (${JSON.stringify(req)})`);

    const registerReq: RegisterUserRequest = this.validationService.validate(
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

    registerReq.password = await bcrypt.hash(registerReq.password, 10);

    const user = await this.prismaService.user.create({
      data: registerReq,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(req: LoginUserRequest): Promise<UserResponse> {
    this.logger.debug(`userService.login (${JSON.stringify(req)})`);

    const loginReq: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      req,
    );

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

  async update(user: User, req: UpdateUserRequest): Promise<UserResponse> {
    this.logger.debug(
      `userService.login (${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const updateReq: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      req,
    );

    if (updateReq.name) user.name = updateReq.name;

    if (updateReq.password)
      user.password = await bcrypt.hash(updateReq.password, 10);

    const result = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: user,
    });

    return {
      username: result.username,
      name: result.name,
    };
  }

  async logout(user: User): Promise<UserResponse> {
    const result = await this.prismaService.user.update({
      where: {
        username: user.username,
      },
      data: {
        token: null,
      },
    });
    return {
      username: result.username,
      name: result.name,
    };
  }
}
