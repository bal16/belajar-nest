import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { WebResponse } from '@model/web.model';
import { ContactResponse, CreateContactRequest } from '@model/contact.model';
import { Auth } from '@common/auth.decorator';
import { User } from '@prisma/client';
import { ContactService } from './contact.service';

@Controller('/api/contacts')
export class ContactController {
  constructor(private userService: ContactService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Auth() user: User,
    @Body() req: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.userService.create(user, req);

    return {
      data: result,
    };
  }
}
