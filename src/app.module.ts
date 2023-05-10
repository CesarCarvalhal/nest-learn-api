import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ActivitiesModule } from './activities/activities.module';
import { UserController } from './users/user.controller';
import { CourseModule } from './courses/courses.module';

config();

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://' + process.env.URL + process.env.DBNAME),
    ActivitiesModule,
    CourseModule,
    SwaggerModule, // Agrega el módulo de Swagger aquí
  ],
  controllers: [UserController],
  providers: [],
})

export class AppModule {}
