import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
  constructor(private contactService: ContactService) {}

  @Post()
  async create(
    @Auth() user: User,
    @Body() req: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.create(user, req);

    return {
      data: result,
    };
  }

  @Get('/:contactId')
  async getById(
    @Auth() user: User,
    @Param('contactId') id: string,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.getById(user, id);
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

    const result = await this.contactService.update(user, req);

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
    await this.contactService.delete(user, id);

    return {
      data: true,
    };
  }

  @Get()
  async search(
    @Auth() user: User,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<ContactResponse[]>> {
    const result = await this.contactService.search(user, {
      name,
      email,
      phone,
      page: page || 1,
      size: size || 10,
    });

    return result;
  }
}
