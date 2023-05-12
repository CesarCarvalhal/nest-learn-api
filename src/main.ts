import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { setupSwagger } from './swagger.builder';

// import * as fs from 'fs';

async function bootstrap() {
  //const httpsOptions = {
  //key: fs.readFileSync('/etc/letsencrypt/live/vm15.netexlearning.cloud-0001/privkey.pem'),

  // cert: fs.readFileSync('/etc/letsencrypt/live/vm15.netexlearning.cloud-0001/fullchain.pem'),
  //};

  //const app = await NestFactory.create(AppModule, { httpsOptions });

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  setupSwagger(app);
  await app.listen(3001);

}

bootstrap();