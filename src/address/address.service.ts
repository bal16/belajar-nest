import { PrismaService } from '@common/prisma.service';
import { ValidationService } from '@common/validation.service';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AddressValidation } from './address.validation';
import { User } from '@prisma/client';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressByIdParams,
} from '@model/address.model';
import { ContactService } from '@contact/contact.service';

@Injectable()
export class AddressService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private contactService: ContactService,
  ) {}

  async create(
    user: User,
    req: CreateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.debug(
      `addressService.create (${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const createReq: CreateAddressRequest = this.validationService.validate(
      AddressValidation.CREATE,
      req,
    );

    await this.contactService.contactMustExist(
      createReq.contactId,
      user.username,
    );

    const address = await this.prismaService.address.create({
      data: createReq,
    });

    return address;
  }

  async getByContactId(
    user: User,
    req: GetAddressByIdParams,
  ): Promise<AddressResponse> {
    this.logger.debug(
      `addressService.getByContactId (${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const validReq: GetAddressByIdParams = this.validationService.validate(
      AddressValidation.GET,
      req,
    );

    await this.contactService.contactMustExist(
      validReq.contactId,
      user.username,
    );

    const address = await this.prismaService.address.findFirst({
      where: {
        id: validReq.addressId,
        contactId: validReq.contactId,
      },
    });

    if (!address) throw new HttpException('Address not found', 404);

    return address;
  }
}
