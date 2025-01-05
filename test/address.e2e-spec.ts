import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('ContactController (e2e)', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);

    testService = app.get(TestService);
  });

  afterAll(async () => {
    await testService.deleteAddress();
    await testService.deleteContact();
    await testService.deleteUser();
  });

  describe('[Create Address API] POST /api/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
    });

    it('should rejected if token is invalid', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .post('/api/contacts/' + contact.id + '/addresses')
        .set('Authorization', 'salah')
        .send({
          username: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should rejected if contactId is invalid', async () => {
      const contactId = testService.sampleCuid();
      const response = await request(app.getHttpServer())
        .post('/api/contacts/' + contactId + '/addresses')
        .set('Authorization', 'test')
        .send({
          country: 'test country',
          postalCode: '123456',
        });

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should rejected if request is invalid', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .post('/api/contacts/' + contact.id + '/addresses')
        .set('Authorization', 'test')
        .send({
          country: '',
          postalCode: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeDefined();
    });

    it('should be able to create contact', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .post('/api/contacts/' + contact.id + '/addresses')
        .set('Authorization', 'test')
        .send({
          street: 'street test',
          city: 'city test',
          province: 'province test',
          country: 'country test',
          postalCode: '123456',
        });

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.data.street).toBe('street test');
      expect(response.body.data.city).toBe('city test');
      expect(response.body.data.province).toBe('province test');
      expect(response.body.data.country).toBe('country test');
      expect(response.body.data.postalCode).toBe('123456');
    });
  });

  describe('[Get Address By Id API] GET /api/contacts/:contactId/adresses/:addressId', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get(
          '/api/contacts/' +
            testService.sampleCuid() +
            '/addresses/' +
            testService.sampleCuid(),
        )
        .set('Authorization', 'salah');

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should be be rejected if contact is not found', async () => {
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .get(
          '/api/contacts/' +
            testService.sampleCuid() +
            '/addresses/' +
            address.id,
        )
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should be be rejected if address is not found', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .get(
          '/api/contacts/' +
            contact.id +
            '/addresses/' +
            testService.sampleCuid(),
        )
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get address', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      logger.info(contact.id);
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + contact.id + '/addresses/' + address.id)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe('street test');
      expect(response.body.data.city).toBe('city test');
      expect(response.body.data.province).toBe('province test');
      expect(response.body.data.country).toBe('country test');
      expect(response.body.data.postalCode).toBe('123456');
    });
  });

  // describe('[Update Contact API] POST /api/contacts/:contactId', () => {
  //   beforeEach(async () => {
  //     await testService.deleteContact();
  //     await testService.deleteUser();
  //     await testService.createUser();
  //     await testService.createContact();
  //   });

  //   it('should rejected if token is invalid', async () => {
  //     const contact = await testService.getContact();
  //     const response = await request(app.getHttpServer())
  //       .patch('/api/contacts/' + contact.id)
  //       .set('Authorization', 'salah')
  //       .send({
  //         phone: '12345',
  //       });

  //     logger.info(response.body);

  //     expect(response.status).toBe(401);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //   });

  //   it('should rejected if contactId is invalid', async () => {
  //     const id = testService.sampleCuid();
  //     const response = await request(app.getHttpServer())
  //       .patch('/api/contacts' + id)
  //       .set('Authorization', 'test')
  //       .send({
  //         email: 'salah@salah.test',
  //       });

  //     logger.info(response.body);

  //     expect(response.status).toBe(404);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //   });

  //   it('should rejected if request is invalid', async () => {
  //     const contact = await testService.getContact();
  //     const response = await request(app.getHttpServer())
  //       .patch('/api/contacts/' + contact.id)
  //       .set('Authorization', 'test')
  //       .send({
  //         email: 'salah',
  //       });

  //     logger.info(response.body);

  //     expect(response.status).toBe(400);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //     expect(response.body.data).toBeDefined();
  //   });

  //   it('should be able to update contact', async () => {
  //     const contact = await testService.getContact();
  //     const response = await request(app.getHttpServer())
  //       .patch('/api/contacts/' + contact.id)
  //       .set('Authorization', 'test')
  //       .send({
  //         first_name: 'test update',
  //         last_name: '2',
  //         email: 'updated@test.test',
  //         phone: '1234567890',
  //       });

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.first_name).toBe('test update');
  //     expect(response.body.data.last_name).toBe('2');
  //     expect(response.body.data.email).toBe('updated@test.test');
  //     expect(response.body.data.phone).toBe('1234567890');
  //   });
  // });

  // describe('[Delete Contact By Id API] GET /api/contacts/:contactId', () => {
  //   beforeEach(async () => {
  //     await testService.deleteContact();
  //     await testService.deleteUser();
  //     await testService.createUser();
  //     await testService.createContact();
  //   });

  //   it('should rejected if token is invalid', async () => {
  //     const response = await request(app.getHttpServer())
  //       .delete('/api/contacts/' + testService.sampleCuid())
  //       .set('Authorization', 'salah');

  //     logger.info(response.body);

  //     expect(response.status).toBe(401);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //   });

  //   it('should be be rejected if contact is not found', async () => {
  //     const response = await request(app.getHttpServer())
  //       .delete('/api/contacts/' + testService.sampleCuid())
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(404);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //   });

  //   it('should be able to remove contact', async () => {
  //     const contact = await testService.getContact();
  //     logger.info(contact.id);
  //     const response = await request(app.getHttpServer())
  //       .delete('/api/contacts/' + contact.id)
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data).toBe(true);
  //   });
  // });

  // describe('[Search Contact API] GET /api/contacts', () => {
  //   beforeEach(async () => {
  //     await testService.deleteContact();
  //     await testService.deleteUser();
  //     await testService.createUser();
  //     await testService.createContact();
  //     await testService.createContact();
  //   });

  //   it('should rejected if token is invalid', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .set('Authorization', 'salah');

  //     logger.info(response.body);

  //     expect(response.status).toBe(401);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //   });

  //   it('should be able to search contacts', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(2);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.total_page).toBe(1);
  //     expect(response.body.paging.size).toBe(10);
  //   });

  //   it('should be able to search contacts by name, email, and phone at the same time', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .query({
  //         name: 'tes',
  //         email: 'test',
  //         phone: '123',
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(2);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.total_page).toBe(1);
  //     expect(response.body.paging.size).toBe(10);
  //   });

  //   it('should be able to search contacts by name', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .query({
  //         name: 'tes',
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(2);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.total_page).toBe(1);
  //     expect(response.body.paging.size).toBe(10);
  //   });

  //   it('should be able to search contacts by name and return zero array', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .query({
  //         name: 'tidak ada',
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(0);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.total_page).toBe(0);
  //     expect(response.body.paging.size).toBe(10);
  //   });

  //   it('should be able to search contacts by email', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .query({
  //         email: 'tes',
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(2);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.total_page).toBe(1);
  //     expect(response.body.paging.size).toBe(10);
  //   });

  //   it('should be able to search contacts by email and return zero array', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .query({
  //         email: 'tidak ada',
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(0);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.total_page).toBe(0);
  //     expect(response.body.paging.size).toBe(10);
  //   });

  //   it('should be able to search contacts by phone', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .query({
  //         phone: '789',
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(2);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.total_page).toBe(1);
  //     expect(response.body.paging.size).toBe(10);
  //   });

  //   it('should be able to search contacts by phone and return zero array', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .query({
  //         phone: '10000000',
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(0);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.total_page).toBe(0);
  //     expect(response.body.paging.size).toBe(10);
  //   });

  //   it('should be able to search contacts then go to another page', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .query({
  //         phone: '789',
  //         page: 5,
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(0);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(5);
  //     expect(response.body.paging.total_page).toBe(1);
  //     expect(response.body.paging.size).toBe(10);
  //   });

  //   it('should be able to search contacts then split it down into pages', async () => {
  //     const response = await request(app.getHttpServer())
  //       .get('/api/contacts')
  //       .query({
  //         phone: '789',
  //         size: 1,
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.length).toBe(1);
  //     expect(response.body.paging).toBeDefined();
  //     expect(response.body.paging.current_page).toBe(1);
  //     expect(response.body.paging.total_page).toBe(2);
  //     expect(response.body.paging.size).toBe(1);
  //   });
  // });
});
