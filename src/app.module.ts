// app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// CONFIG
import { config } from 'dotenv';
config()

// ROUTES
import { ActivitiesModule } from './activities/activities.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://' + process.env.URL + process.env.DBNAME),
    ActivitiesModule,
  ],
})

export class AppModule {}