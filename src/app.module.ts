import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';

import config from './config/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.MONGO_URI, {
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('Connected To Database ✅');
        });

        connection.on('disconnected', () => {
          console.log('Disconnected To Database ❌');
        });

        connection.on('error', (error) => {
          console.log('Database Connection Error ❌ ', error);
        });

        connection._events.connected();
        return connection;
      },
    }),
    CacheModule.register(),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
