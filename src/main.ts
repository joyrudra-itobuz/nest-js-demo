import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config/config';
import loggerMiddleware from './shared/middlewares/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    abortOnError: false,
  });

  app.use(loggerMiddleware);

  await app.listen(config.PORT);
  console.log(`Server Listening On Port ${await app.getUrl()}`);
}
bootstrap();
