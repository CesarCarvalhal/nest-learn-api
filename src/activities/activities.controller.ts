// activities.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Req, UseGuards, NotFoundException, UnauthorizedException, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Activity } from './activities.schema';
import { ActivitiesService } from './activities.service';
import { Auth0Guard, auth0Access } from 'src/auth/auth0.guard';
import { Request } from 'express';
import axios from 'axios';

@Controller('rest/activities')
@UseGuards(Auth0Guard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) { }

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
      throw new HttpException('Token no encontrado', HttpStatus.UNAUTHORIZED);
    }
    const user = await this.getUserFromToken(token);
    await this.verifyUserIsAdmin(user.sub);
    try {
      const createdActivity = await this.activitiesService.createActivity(activityData, user.sub);
      return createdActivity;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException('Error en la solicitud', HttpStatus.BAD_REQUEST);
      } else if (error instanceof UnauthorizedException) {
        throw new HttpException('Acceso no autorizado', HttpStatus.UNAUTHORIZED);
      } else {
        throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }


  @Get()
  async getAllActivities(): Promise<Activity[]> {
    try {
      return await this.activitiesService.getAllActivities();
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getActivityById(@Param('id') id: string): Promise<Activity> {
    try {
      const activity = await this.activitiesService.getActivityById(id);
      if (!activity) {
        throw new NotFoundException('Actividad no encontrada');
      }
      return activity;
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateActivity(@Param('id') id: string, @Body() activityData: Partial<Activity>, @Req() request: Request): Promise<Activity> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new NotFoundException('Token no encontrado');
    }
    const user = await this.getUserFromToken(token);
    await this.verifyUserIsAdmin(user.sub);
    try {
      const updatedActivity = await this.activitiesService.updateActivity(id, activityData);
      if (!updatedActivity) {
        throw new NotFoundException('Actividad no encontrada');
      }
      return updatedActivity;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException('Error en la solicitud', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Delete(':id')
  async deleteActivity(@Param('id') id: string, @Req() request: Request): Promise<Activity> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new NotFoundException('Token no encontrado');
    }
    const user = await this.getUserFromToken(token);
    await this.verifyUserIsAdmin(user.sub);
    try {
      const deletedActivity = await this.activitiesService.deleteActivity(id);
      if (!deletedActivity) {
        throw new NotFoundException('Actividad no encontrada');
      }
      return deletedActivity;
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Mark the activity as viewed by the user
  @Post(':id/view')
  async markActivityAsViewed(@Param('id') id: string, @Req() request: Request): Promise<void> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new NotFoundException('Token no encontrado');
    }
    const user = await this.getUserFromToken(token);
    try {
      await this.activitiesService.markActivityAsViewed(id, user.sub);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException('Actividad no encontrada', HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get all the viewers for the activity id
  @Get(':id/viewers')
  async getActivityViewers(@Param('id') id: string): Promise<string[]> {
    try {
      const activity = await this.activitiesService.getActivityById(id);
      if (!activity) {
        throw new NotFoundException('Actividad no encontrada');
      }
      return activity.viewed_by;
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Get all the viewed activities for the user id
  @Get("user/:id")
  async getAllViewedActivities(@Param('id') id: string): Promise<Activity[]> {
    try {
      const activities = await this.activitiesService.getViwedActivitiesByUser(id);
      if (!activities || activities.length === 0) {
        throw new NotFoundException('No se encontraron actividades vistas para este usuario.');
      }
      return activities;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new BadRequestException('ID de usuario no válido.');
      }
    }
  }
}


