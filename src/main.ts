import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    abortOnError: false,
  });
  console.log(`Server Listening On Port ${await app.getUrl()}`);
  await app.listen(config.PORT);
}
bootstrap();
