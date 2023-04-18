// activities.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { Activity } from './activities.schema';
import { ActivitiesService } from './activities.service';
import { Auth0Guard } from 'src/auth/auth0.guard';
import { Response, Request } from 'express';
import axios from 'axios';

@Controller('rest/activities')
@UseGuards(Auth0Guard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}
  
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  // Función para obtener información del usuario desde el token de autorización
  private async getUserFromToken(token: string): Promise<any> {
    try {
      const response = await axios.get('https://fct-netex.eu.auth0.com/userinfo', {

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  @Post()
  async createActivity(@Req() request: Request, @Body() activityData: Partial<Activity>): Promise<Activity> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new NotFoundException('Token not found');
    }
    const user = await this.getUserFromToken(token);
    return this.activitiesService.createActivity(activityData, user.sub);
  }
  
  @Get()
  async getAllActivities(): Promise<Activity[]> {
    return this.activitiesService.getAllActivities();
  }

  @Get(':id')
  async getActivityById(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.getActivityById(id);
  }

  @Put(':id')
  async updateActivity(
    @Param('id') id: string,
    @Body() updatedActivityData: Partial<Activity>,
  ): Promise<Activity> {
    return this.activitiesService.updateActivity(id, updatedActivityData);
  }

  @Delete(':id')
  async deleteActivity(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.deleteActivity(id);
  }
}