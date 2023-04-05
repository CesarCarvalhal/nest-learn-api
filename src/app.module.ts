import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// ROUTES
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ActivitiesController } from './controllers/activities.controller';
import { ActivitiesService } from './services/activities.service';
import { Activity, ActivitySchema } from './schemas/activities.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/db-test'),
    MongooseModule.forFeature([{ name: Activity.name, schema: ActivitySchema }]),
  ],
  controllers: [AppController, ActivitiesController],
  providers: [AppService, ActivitiesService],

})
export class AppModule {}