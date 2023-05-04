// course.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './courses.schema';
import { Activity, ActivityDocument } from 'src/activities/activities.schema';
import { NotFoundException } from '@nestjs/common';


@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) { }

  
  // POSTS
  async createCourse(course: Partial<Course>, created_by: string): Promise<Course> {
    const createdCourse = new this.courseModel(course);
    createdCourse.created_by = created_by;
    createdCourse.created_at = new Date().getTime().toString();

    return createdCourse.save();
  }

  async addActivityToCourse(courseId: string, activityId: string): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const activity = await this.activityModel.findById(activityId).exec();
    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }

    course.activities.push(activityId);
    return course.save();
  }


  // GETS
  async getAllCourses(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  async getCourseById(id: string): Promise<Course> {
    return this.courseModel.findById(id).exec();
  }


  // PUTS
  async updateCourseById(id: string, course: Partial<Course>): Promise<Course> {
    const updatedCourse = await this.courseModel.findByIdAndUpdate(id, course, { new: true }).exec();
    if (!updatedCourse) {
      throw new NotFoundException('Curso no encontrado');
    }
    return updatedCourse;
  }


  // DELETES
  async deleteCourseById(id: string): Promise<Course> {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      throw new NotFoundException('Curso no encontrado');
    }

    await this.activityModel.deleteMany({ course: deletedCourse._id }).exec();
    return deletedCourse;
  }

  async removeActivityFromCourse(courseId: string, activityId: string): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException('Curso no encontrado');
    }

    const activity = await this.activityModel.findById(activityId).exec();
    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }

    course.activities = course.activities.filter(activity => activity != activityId);
    return course.save();
  }

}