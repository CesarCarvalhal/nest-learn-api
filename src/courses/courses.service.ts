import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './courses.schema';
import { Activity, ActivityDocument } from 'src/activities/activities.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) { }

  async createCourse(course: Partial<Course>, created_by: string): Promise<Course> {
    const createdCourse = new this.courseModel(course);
    createdCourse.created_by = created_by;
    createdCourse.created_at = new Date().getTime().toString();

    return createdCourse.save();
  }
}