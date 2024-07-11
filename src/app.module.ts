import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import config from './config/config';
import { CatsModule } from './cat/cats.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.MONGO_URI, {
      connectionFactory: (connection) => {
        connection.once('open', () => {
          console.log('MongoDB connection established');
        });
        connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });
        return connection;
      },
    }),
    CatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
