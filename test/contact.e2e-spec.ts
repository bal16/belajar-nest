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
    await testService.deleteContact();
    await testService.deleteUser();
  });

  describe('[Create Contact API] POST /api/contacts', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
    });

    it('should rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', 'salah')
        .send({
          username: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', 'test')
        .send({
          username: 'test',
          first_name: '',
          last_name: '',
          email: 'salah',
          phone: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeDefined();
    });

    it('should be able to create contact', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', 'test')
        .send({
          username: 'test',
          first_name: 'test',
          last_name: '1',
          email: 'test@test.test',
          phone: '08123456789',
        });

      logger.info(response.body);

      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.first_name).toBe('test');
      expect(response.body.data.last_name).toBe('1');
      expect(response.body.data.email).toBe('test@test.test');
      expect(response.body.data.phone).toBe('08123456789');
    });
  });

  describe('[Get Contact By Id API] GET /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteContact();
      await testService.deleteUser();
      await testService.createUser();
      await testService.createContact();
    });

    it('should rejected if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + testService.sampleCuid())
        .set('Authorization', 'salah');

      logger.info(response.body);

      expect(response.status).toBe(401);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should be be rejected if contact is not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + testService.sampleCuid())
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body).toBeDefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get contact', async () => {
      const contact = await testService.getContact();
      logger.info(contact.id);
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + contact.id)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.first_name).toBe('test');
      expect(response.body.data.last_name).toBe('1');
      expect(response.body.data.email).toBe('test@test.test');
      expect(response.body.data.phone).toBe('08123456789');
    });
  });

  // describe('[Login User API] POST /api/users/login', () => {
  //   beforeEach(async () => {
  //     await testService.deleteUser();
  //     await testService.createUser();
  //   });

  //   it('should rejected if request is invalid', async () => {
  //     const response = await request(app.getHttpServer())
  //       .post('/api/users/login')
  //       .send({
  //         username: '',
  //         password: '',
  //       });

  //     logger.info(response.body);

  //     expect(response.status).toBe(400);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //     expect(response.body.data).toBeDefined();
  //   });

  //   it('should be able to login', async () => {
  //     const response = await request(app.getHttpServer())
  //       .post('/api/users/login')
  //       .send({
  //         username: 'test',
  //         password: 'test',
  //       });

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.username).toBe('test');
  //     expect(response.body.data.name).toBe('test');
  //     expect(response.body.data.token).toBeDefined();
  //   });
  // });

  // describe('[Update User API] PATCH /api/users/current', () => {
  //   beforeEach(async () => {
  //     await testService.deleteUser();
  //     await testService.createUser();
  //   });

  //   it('should rejected if token is invalid', async () => {
  //     const response = await request(app.getHttpServer())
  //       .patch('/api/users/current')
  //       .set('Authorization', 'salah')
  //       .send({
  //         name: 'test update',
  //       });

  //     logger.info(response.body);

  //     expect(response.status).toBe(401);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //   });

  //   it('should rejected if request is invalid', async () => {
  //     const response = await request(app.getHttpServer())
  //       .patch('/api/users/current')
  //       .set('Authorization', 'test')
  //       .send({
  //         name: '',
  //         password: '',
  //       });

  //     logger.info(response.body);

  //     expect(response.status).toBe(400);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //     expect(response.body.data).toBeDefined();
  //   });

  //   it('should be able to update name', async () => {
  //     const response = await request(app.getHttpServer())
  //       .patch('/api/users/current')
  //       .send({
  //         username: 'test',
  //         name: 'test updated',
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.username).toBe('test');
  //     expect(response.body.data.name).toBe('test updated');
  //   });

  //   it('should be able to update password', async () => {
  //     let response = await request(app.getHttpServer())
  //       .patch('/api/users/current')
  //       .send({
  //         username: 'test',
  //         password: 'test updated',
  //       })
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.username).toBe('test');
  //     expect(response.body.data.name).toBe('test');

  //     response = await request(app.getHttpServer())
  //       .post('/api/users/login')
  //       .send({
  //         username: 'test',
  //         password: 'test updated',
  //       });

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data.username).toBe('test');
  //     expect(response.body.data.name).toBe('test');
  //     expect(response.body.data.token).toBeDefined();
  //   });
  // });

  // describe('[Logout Current User API] DELETE /api/users/current', () => {
  //   beforeEach(async () => {
  //     await testService.deleteUser();
  //     await testService.createUser();
  //   });

  //   it('should rejected if token is invalid', async () => {
  //     const response = await request(app.getHttpServer())
  //       .delete('/api/users/current')
  //       .set('Authorization', 'salah');

  //     logger.info(response.body);

  //     expect(response.status).toBe(401);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.errors).toBeDefined();
  //   });

  //   it('should be able to logout', async () => {
  //     const response = await request(app.getHttpServer())
  //       .delete('/api/users/current')
  //       .set('Authorization', 'test');

  //     logger.info(response.body);

  //     expect(response.status).toBe(200);
  //     expect(response.body).toBeDefined();
  //     expect(response.body.data).toBe(true);

  //     const user = await testService.getUser();

  //     expect(user.token).toBeNull();
  //   });
  // });
});
