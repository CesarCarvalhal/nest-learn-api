// activities.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './activities.schema';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async createActivity(activityData: Partial<Activity>, created_by: string): Promise<Activity> {
    const activity = new this.activityModel(activityData);
    activity.created_by = created_by;
    activity.created_at = new Date().getTime().toString();
    const savedActivity = await activity.save();
    return savedActivity;
  }

  async getAllActivities(): Promise<Activity[]> {
    return this.activityModel.find().exec();
  }

  async getActivityById(id: string): Promise<Activity> {
    return this.activityModel.findById(id).exec();
  }

  async updateActivity(
    id: string,
    updatedActivityData: Partial<Activity>,
  ): Promise<Activity> {
    const activity = await this.activityModel
      .findByIdAndUpdate(id, updatedActivityData, { new: true })
      .exec();
    return activity;
  }

  async deleteActivity(id: string): Promise<Activity> {
    const activity = await this.activityModel.findByIdAndDelete(id).exec();
    return activity;
  }

  async viewActivity(id: string, created_by: string): Promise<void> {
    const activity = await this.activityModel.findById(id);
    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }
    if (!activity.viewed_by.includes(created_by)) {
      activity.viewed_by.push(created_by);
      await activity.save();
    }
  }
}
