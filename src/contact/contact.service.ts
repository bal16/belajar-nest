import { PrismaService } from '@common/prisma.service';
import { ValidationService } from '@common/validation.service';
import { ContactResponse, CreateContactRequest } from '@model/contact.model';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ContactValidation } from './contact.validation';
import { User } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

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
}
