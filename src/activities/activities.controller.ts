// activities.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Req, UseGuards, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Activity } from './activities.schema';
import { ActivitiesService } from './activities.service';
import { Auth0Guard, auth0Access } from 'src/auth/auth0.guard';
import { Request } from 'express';
import axios from 'axios';

@Controller('rest/activities')
@UseGuards(Auth0Guard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async getUserFromToken(token: string): Promise<any> {
    try {
      const response = await axios.get('https://fct-netex.eu.auth0.com/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  private async verifyUserIsAdmin(userSub: string): Promise<void> {
    const userRolesResponse = await axios.get(`https://fct-netex.eu.auth0.com/api/v2/users/${encodeURIComponent(userSub)}/roles`, {
      headers: {
        Authorization: `Bearer ${await auth0Access()}`,
      },
    });
    const userRoles = userRolesResponse.data;
    if (!userRoles.some(role => role.name === "admin")) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
  }

  @Post()
  async createActivity(@Req() request: Request, @Body() activityData: Partial<Activity>): Promise<Activity> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new NotFoundException('Token no encontrado');
    }
    const user = await this.getUserFromToken(token);
    await this.verifyUserIsAdmin(user.sub);
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
  async updateActivity(@Param('id') id: string, @Body() activityData: Partial<Activity>, @Req() request: Request): Promise<Activity> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new NotFoundException('Token no encontrado');
    }
    const user = await this.getUserFromToken(token);
    await this.verifyUserIsAdmin(user.sub);
    return this.activitiesService.updateActivity(id, activityData);
  }

  @Delete(':id')
  async deleteActivity(@Param('id') id: string, @Req() request: Request): Promise<Activity> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new NotFoundException('Token no encontrado');
    }
    const user = await this.getUserFromToken(token);
    await this.verifyUserIsAdmin(user.sub);
    return this.activitiesService.deleteActivity(id);
  }

  @Post(':id/view')
  async viewActivity(@Param('id') id: string, @Req() request: Request): Promise<void> {
  const token = this.extractTokenFromHeader(request);
  if (!token) {
    throw new NotFoundException('Token no encontrado');
  }
  const user = await this.getUserFromToken(token);
  return this.activitiesService.viewActivity(id, user.sub);
  
}

  @Get(':id/viewers')
  async getActivityViewers(@Param('id') id: string): Promise<string[]> {
  const activity = await this.activitiesService.getActivityById(id);
  return activity.viewed_by;
}
}