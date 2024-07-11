import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import config from './config/config';
import { CatsModule } from './cat/cats.module';

@Module({
  imports: [MongooseModule.forRoot(config.MONGO_URI), CatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
