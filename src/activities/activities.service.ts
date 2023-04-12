// activities.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './activities.schema';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async getAllActivities(): Promise<Activity[]> {
    return this.activityModel.find().exec();
  }

  async getActivityById(id: string): Promise<Activity> {
    return this.activityModel.findById(id).exec();
  }

  async createActivity(activityData: Partial<Activity>): Promise<Activity> {
    const userId = activityData.userId; 
    const activity = new this.activityModel(activityData);
    activity.created_at = new Date().getTime().toString();
    activity.userId = userId; 
    const savedActivity = await activity.save();
    return savedActivity;
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
}
