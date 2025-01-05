import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WebResponse } from '@model/web.model';
import { Auth } from '@common/auth.decorator';
import { User } from '@prisma/client';
import { AddressService } from './address.service';
import {
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '@model/address.model';

@Controller('/api/contacts/:contactId/addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post()
  async create(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Body() req: CreateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    req.contactId = contactId;
    const result = await this.addressService.create(user, req);

    return {
      data: result,
    };
  }

  @Get('/:id')
  async getById(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('id') addressId: string,
  ): Promise<WebResponse<AddressResponse>> {
    const result = await this.addressService.getByContactId(user, {
      contactId,
      addressId,
    });

    return {
      data: result,
    };
  }

  @Patch('/:id')
  async update(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('id') addressId: string,
    @Body() req: UpdateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    req.id = addressId;
    req.contactId = contactId;
    const result = await this.addressService.update(user, req);

    return {
      data: result,
    };
  }

  @Delete('/:id')
  async remove(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Param('id') addressId: string,
  ): Promise<WebResponse<boolean>> {
    await this.addressService.remove(user, {
      contactId,
      addressId,
    });

    return {
      data: true,
    };
  }

  @Get()
  async list(
    @Auth() user: User,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<AddressResponse[]>> {
    const result = await this.addressService.list(user, contactId);

    return {
      data: result,
    };
  }
}
