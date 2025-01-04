import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '@model/web.model';
import { RegisterUserRequest, UserResponse } from '@model/user.model';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async register(
    @Body() req: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(req);
    return {
      data: result,
    };
  }
}
