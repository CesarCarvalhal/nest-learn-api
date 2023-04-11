import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';

// CONFIG
import { config } from 'dotenv';
config();

// ROUTES
import { AppController } from './app.controller';
import { AppService } from './app.service';


@Module({
  imports: [
    MongooseModule.forRoot('mongodb://' + process.env.URL + process.env.DBNAME),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}