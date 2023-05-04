import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from 'src/courses/courses.controller';
import { CourseService } from 'src/courses/courses.service';
import { Course, CourseSchema } from 'src/courses/courses.schema';
import { Activity, ActivitySchema } from '../activities/activities.schema';
import { ActivitiesService } from 'src/activities/activities.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Course.name, schema: CourseSchema },
            { name: Activity.name, schema: ActivitySchema },
        ]),
    ],
    controllers: [CourseController],
    providers: [CourseService, ActivitiesService],
})
export class CourseModule { }
