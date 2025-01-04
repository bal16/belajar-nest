import { PrismaService } from '@common/prisma.service';
import { ValidationService } from '@common/validation.service';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from '@model/contact.model';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ContactValidation } from './contact.validation';
import { Contact, User } from '@prisma/client';
import { WebResponse } from '@model/web.model';

@Injectable()
export class ContactService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async contactMustExist(id: string, username: string): Promise<Contact> {
    const contact = await this.prismaService.contact.findFirst({
      where: {
        id,
        username,
      },
    });

    if (!contact) throw new HttpException('Contact not found', 404);

    return contact;
  }

  async create(
    user: User,
    req: CreateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.debug(`contactService.create (${JSON.stringify(req)})`);

    const createReq: CreateContactRequest = this.validationService.validate(
      ContactValidation.CREATE,
      req,
    );

    const contact = await this.prismaService.contact.create({
      data: {
        username: user.username,
        ...createReq,
      },
    });

    return contact;
  }

  async getById(user: User, id: string): Promise<ContactResponse> {
    this.logger.debug(`contactService.create (${JSON.stringify(user)}, ${id})`);

    const validId: string = this.validationService.validate(
      ContactValidation.ID,
      id,
    );

    const contact = await this.contactMustExist(validId, user.username);

    return contact;
  }

  async update(
    user: User,
    req: UpdateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.debug(
      `contactService.update (${JSON.stringify(user)}, ${JSON.stringify(req)})`,
    );

    const updateReq: UpdateContactRequest = this.validationService.validate(
      ContactValidation.UPDATE,
      req,
    );

    let contact = await this.contactMustExist(updateReq.id, user.username);

    contact = await this.prismaService.contact.update({
      where: {
        id: contact.id,
        username: contact.username,
      },
      data: updateReq,
    });

    return contact;
  }

  async delete(user: User, id: string): Promise<ContactResponse> {
    this.logger.debug(`contactService.delete (${id}, ${JSON.stringify(user)})`);

    const validId: string = this.validationService.validate(
      ContactValidation.ID,
      id,
    );

    await this.contactMustExist(validId, user.username);

    const contact = await this.prismaService.contact.delete({
      where: {
        id: validId,
        username: user.username,
      },
    });

    return contact;
  }

  async search(
    user: User,
    req: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    this.logger.debug(`contactService.search (${JSON.stringify(req)})`);

    const searchReq: SearchContactRequest = this.validationService.validate(
      ContactValidation.SEARCH,
      req,
    );

    const filter = [];

    if (searchReq.name)
      filter.push({
        OR: [
          {
            first_name: {
              contains: searchReq.name,
            },
          },
          {
            last_name: {
              contains: searchReq.name,
            },
          },
        ],
      });

    if (searchReq.email)
      filter.push({
        email: {
          contains: searchReq.email,
        },
      });

    if (searchReq.phone)
      filter.push({
        phone: {
          contains: searchReq.phone,
        },
      });

    const contacts = await this.prismaService.contact.findMany({
      where: {
        username: user.username,
        AND: filter,
      },
      take: searchReq.size,
      skip: searchReq.size * (searchReq.page - 1),
    });

    const total = await this.prismaService.contact.count({
      where: {
        username: user.username,
        AND: filter,
      },
    });

    return {
      data: contacts,
      paging: {
        size: searchReq.size,
        current_page: searchReq.page,
        total_page: Math.ceil(total / searchReq.size),
      },
    };
  }
}
