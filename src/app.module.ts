// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// CONFIG
import { config } from 'dotenv';
config()

// USERS
import { UserController } from './users/user.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://' + process.env.URL + process.env.DBNAME),
  ],
  controllers: [UserController],
  providers: [],
})
export class AppModule {}