// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// CONFIG
import { config } from 'dotenv';
config()

// ROUTES
import { UserModule } from './users/user.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://' + process.env.URL + process.env.DBNAME),
    UserModule
  ]

})
export class AppModule {}