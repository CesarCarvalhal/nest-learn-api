// activities.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Req, UseGuards, NotFoundException, UnauthorizedException, HttpException, HttpStatus, BadRequestException, Patch } from '@nestjs/common';
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

  private validateActivityData(activityData: Partial<Activity>) {
    const { type, content, options, isTrue } = activityData;
  
    if (!['Text', 'True/False', 'Multiple options'].includes(type)) {
      throw new BadRequestException('Tipo de actividad no válido');
    }
  
    if (type === 'True/False' && (isTrue === undefined || isTrue === null)) {
      throw new BadRequestException('Falta el valor True/False');
    }
  
    if (type === 'Multiple options') {
      if (!options || options.length < 2) {
        throw new BadRequestException('Se requieren al menos 2 opciones');
      }
  
      const correctOptions = options.filter((option) => option.correct);
      if (correctOptions.length !== 1) {
        throw new BadRequestException('Se requiere exactamente 1 opción correcta');
      }
    }
  }
  

  
  // GETS

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

    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity){
      throw new NotFoundException('Actividad no encontrada')
    }

    try {
      return activity;
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/viewers')
  async getActivityViewers(@Param('id') id: string): Promise<string[]> {

    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity){
      throw new NotFoundException('Actividad no encontrada')
    }

    try {
      const activity = await this.activitiesService.getActivityById(id);
      return activity.viewed_by;
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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


  // POSTS

  @Post()
  async createActivity(@Req() request: Request, @Body() activityData: Partial<Activity>): Promise<{ status: HttpStatus, message: string }> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }
    const user = await this.getUserFromToken(token);
    await this.verifyUserIsAdmin(user.sub);
    await this.validateActivityData(activityData);
    
    activityData.description = activityData.description || '';
    activityData.image = activityData.image || '';
    
    try {
      await this.activitiesService.createActivity(activityData, user.sub);
      return { status: HttpStatus.CREATED, message: 'Actividad creada correctamente' };
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
  

  @Post(':id/view')
  async markActivityAsViewed(@Param('id') id: string, @Req() request: Request): Promise<void> {
    
    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity){
      throw new NotFoundException('Actividad no encontrada')
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }
    const user = await this.getUserFromToken(token);
    try {
      await this.activitiesService.markActivityAsViewed(id, user.sub);
    }
    catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  // PUT

  @Put(':id')
  async updateActivity(@Param('id') id: string, @Body() activityData: Partial<Activity>, @Req() request: Request): Promise<{ status: HttpStatus, message: string }> {
    
    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity){
      throw new NotFoundException('Actividad no encontrada')
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }
    const user = await this.getUserFromToken(token);
    await this.verifyUserIsAdmin(user.sub);

    try {
      await this.activitiesService.updateActivity(id, activityData);
      return { status: HttpStatus.OK, message: 'Actividad actualizada correctamente' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException('Error en la solicitud', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }


  // DELETE

  @Delete(':id')
  async deleteActivity(@Param('id') id: string, @Req() request: Request): Promise<{ status: HttpStatus, message: string }> {

    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity){
      throw new NotFoundException('Actividad no encontrada')
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token no encontrado');
    }

    const user = await this.getUserFromToken(token);
    await this.verifyUserIsAdmin(user.sub);

    try {
      await this.activitiesService.deleteActivity(id);
      return { status: HttpStatus.OK, message: 'Actividad eliminada correctamente' };
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  // Check student answers to the activity
  @Patch('answer/:id')
  async checkAnswer(@Param('id') id: string, @Body() body: Partial<any>): Promise<{ status: HttpStatus, isCorrect: boolean }> {

    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity){
      throw new NotFoundException('Actividad no encontrada')
    }

    try {
      const answerResponse = await this.activitiesService.checkAnswer(body.answer, activity);
      return { status: HttpStatus.OK, isCorrect: answerResponse };
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}