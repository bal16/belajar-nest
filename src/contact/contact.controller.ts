import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WebResponse } from '@model/web.model';
import {
  ContactResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from '@model/contact.model';
import { Auth } from '@common/auth.decorator';
import { User } from '@prisma/client';
import { ContactService } from './contact.service';

@Controller('/api/contacts')
export class ContactController {
  constructor(private userService: ContactService) {}

  @Post()
  async create(
    @Auth() user: User,
    @Body() req: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.userService.create(user, req);

    return {
      data: result,
    };
  }

  @Get('/:contactId')
  async getById(
    @Auth() user: User,
    @Param('contactId') id: string,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.userService.getById(user, id);
    return {
      data: result,
    };
  }

  @Patch('/:contactId')
  @HttpCode(200)
  async updateById(
    @Auth() user: User,
    @Param('contactId') id: string,
    @Body() req: UpdateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    req.id = id;

    const result = await this.userService.update(user, req);

    return {
      data: result,
    };
  }

  @Delete('/:contactId')
  @HttpCode(200)
  async deleteById(
    @Auth() user: User,
    @Param('contactId') id: string,
  ): Promise<WebResponse<boolean>> {
    await this.userService.delete(user, id);

    return {
      data: true,
    };
  }
}
