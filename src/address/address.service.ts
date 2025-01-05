import { PrismaService } from '@common/prisma.service';
import { ValidationService } from '@common/validation.service';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AddressValidation } from './address.validation';
import { User } from '@prisma/client';
import { AddressResponse, CreateAddressRequest } from '@model/address.model';
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
}
