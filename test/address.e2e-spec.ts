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

  describe('[Update Address API] PATCh /api/contacts/:contactId/addresses/:addressId', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
    });

    it('should rejected if token is invalid', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .patch('/api/contacts/' + contact.id + '/addresses/' + address.id)
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
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .patch('/api/contacts/' + contactId + '/addresses/' + address.id)
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

    it('should rejected if addressId is invalid', async () => {
      const contact = await testService.getContact();
      const addressId = testService.sampleCuid();
      const response = await request(app.getHttpServer())
        .patch('/api/contacts/' + contact.id + '/addresses/' + addressId)
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
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .patch('/api/contacts/' + contact.id + '/addresses/' + address.id)
        .set('Authorization', 'test')
        .send({
          country: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeDefined();
    });

    it('should be able to update address', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      const response = await request(app.getHttpServer())
        .patch('/api/contacts/' + contact.id + '/addresses/' + address.id)
        .set('Authorization', 'test')
        .send({
          street: 'street test update',
          city: 'city test update',
          province: 'province test update',
          country: 'country test update',
          postalCode: '654321',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe('street test update');
      expect(response.body.data.city).toBe('city test update');
      expect(response.body.data.province).toBe('province test update');
      expect(response.body.data.country).toBe('country test update');
      expect(response.body.data.postalCode).toBe('654321');
    });
  });

  describe('[Remove Address By Id API] DELETE /api/contacts/:contactId/adresses/:addressId', () => {
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
        .delete(
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
        .delete(
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
        .delete(
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

    it('should be able to delete address', async () => {
      const contact = await testService.getContact();
      const address = await testService.getAddress();
      logger.info(contact.id);
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/' + contact.id + '/addresses/' + address.id)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.data).toBe(true);
    });
  });

  describe('[List Address API] GET /api/contacts/:contactId/addresses', () => {
    beforeEach(async () => {
      await testService.deleteAddress();
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
      await testService.createAddress();
      await testService.createAddress();
    });

    it('should rejected if token is invalid', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + contact.id + '/addresses')
        .set('Authorization', 'salah');

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should rejected if contactId is invalid', async () => {
      const contactId = testService.sampleCuid();
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + contactId + '/addresses')
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get list of contact', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + contact.id + '/addresses')
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.data.length).toBe(2);
    });
  });
});
