import { Body, Controller, Param, Post } from '@nestjs/common';
import { WebResponse } from '@model/web.model';
import { Auth } from '@common/auth.decorator';
import { User } from '@prisma/client';
import { AddressService } from './address.service';
import { AddressResponse, CreateAddressRequest } from '@model/address.model';

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
}
