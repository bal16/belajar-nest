import { PrismaService } from '@common/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}
  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async getUser(): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        username: 'test',
      },
    });
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        name: 'test',
        password: await bcrypt.hash('test', 10),
        token: 'test',
      },
    });
  }

  async createContact() {
    await this.prismaService.contact.create({
      data: {
        username: 'test',
        first_name: 'test',
        last_name: '1',
        email: 'test@test.test',
        phone: '08123456789',
      },
    });
  }

  async getContact() {
    return await this.prismaService.contact.findFirst({
      where: {
        username: 'test',
      },
    });
  }

  async deleteContact() {
    await this.prismaService.contact.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async createAddress() {
    const contact = await this.getContact();
    await this.prismaService.address.create({
      data: {
        street: 'street test',
        city: 'city test',
        province: 'province test',
        country: 'country test',
        postalCode: '123456',
        contactId: contact.id,
      },
    });
  }

  async getAddress() {
    const contact = await this.getContact();
    return await this.prismaService.address.findFirst({
      where: {
        contactId: contact.id,
      },
    });
  }

  async deleteAddress() {
    await this.prismaService.address.deleteMany({
      where: {
        contact: {
          username: 'test',
        },
      },
    });
  }

  sampleCuid() {
    return 'cm5i6f2w800020cjyfyeacpc9';
  }
}
