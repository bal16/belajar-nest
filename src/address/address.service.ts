import { PrismaService } from '@common/prisma.service';
import { ValidationService } from '@common/validation.service';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AddressValidation } from './address.validation';
import { Address, User } from '@prisma/client';
import {
  AddressResponse,
  CreateAddressRequest,
  DeleteAddressByIdParams,
  GetAddressByIdParams,
  UpdateAddressRequest,
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

  async addressMustExist(id: string, contactId: string): Promise<Address> {
    const address = await this.prismaService.address.findFirst({
      where: {
        id,
        contactId,
      },
    });

    if (!address) throw new HttpException('Address not found', 404);

    return address;
  }

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

    const address = await this.addressMustExist(
      validReq.addressId,
      validReq.contactId,
    );

    return address;
  }

  async update(
    user: User,
    req: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.debug(
      `addressService.update (${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const updateReq: UpdateAddressRequest = this.validationService.validate(
      AddressValidation.UPDATE,
      req,
    );

    await this.contactService.contactMustExist(
      updateReq.contactId,
      user.username,
    );

    let address = await this.addressMustExist(
      updateReq.id,
      updateReq.contactId,
    );

    address = await this.prismaService.address.update({
      where: {
        id: address.id,
        contactId: address.contactId,
      },
      data: updateReq,
    });

    return address;
  }

  async remove(
    user: User,
    req: DeleteAddressByIdParams,
  ): Promise<AddressResponse> {
    this.logger.debug(
      `addressService.remove (${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const deleteReq: DeleteAddressByIdParams = this.validationService.validate(
      AddressValidation.DELETE,
      req,
    );

    await this.contactService.contactMustExist(
      deleteReq.contactId,
      user.username,
    );

    let address = await this.addressMustExist(
      deleteReq.addressId,
      deleteReq.contactId,
    );

    address = await this.prismaService.address.delete({
      where: {
        id: address.id,
        contactId: address.contactId,
      },
    });

    return address;
  }

  async list(user: User, contactId: string): Promise<AddressResponse[]> {
    this.logger.debug(
      `addressService.list (${JSON.stringify(user)}, ${JSON.stringify(contactId)})`,
    );

    const validContactId: string = this.validationService.validate(
      AddressValidation.LIST,
      contactId,
    );

    console.log('🚀 ~ AddressService ~ list ~ validContactId:', validContactId);

    await this.contactService.contactMustExist(validContactId, user.username);

    const addresses = await this.prismaService.address.findMany({
      where: {
        contactId: validContactId,
      },
    });

    return addresses;
  }
}
