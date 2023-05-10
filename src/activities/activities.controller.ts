// activities.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, Req, UseGuards, NotFoundException, UnauthorizedException, HttpException, HttpStatus, BadRequestException, Patch } from '@nestjs/common';
import { Activity } from './activities.schema';
import { ActivitiesService } from './activities.service';
import { Auth0Guard, auth0Access } from 'src/auth/auth0.guard';
import { Request } from 'express';
import axios from 'axios';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';


@ApiTags('Actividades')
@ApiBearerAuth()
@ApiOkResponse({ type: Activity })



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


  /*-------------------------------------- GET --------------------------------------*/

  @Get()

  @ApiOperation({ summary: 'Obtener todas las actividades', description: 'Obtiene todas las actividades' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })

  async getAllActivities(): Promise<Activity[]> {
    try {
      return await this.activitiesService.getAllActivities();
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get(':id')

  @ApiOperation({ summary: 'Obtener actividad por ID', description: 'Obtiene una actividad por ID' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })

  @ApiParam({
    name: 'id',
    description: 'ID de la actividad',
    required: true,
  })

  async getActivityById(@Param('id') id: string): Promise<Activity> {

    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity) {
      throw new NotFoundException('Actividad no encontrada')
    }

    try {
      return activity;
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Get(':id/viewers')

  @ApiOperation({ summary: 'Obtener usuarios que han visto la actividad', description: 'Obtiene los usuarios que han visto la actividad' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })

  @ApiParam({
    name: 'id',
    description: 'ID de la actividad',
    required: true,
  })

  async getActivityViewers(@Param('id') id: string): Promise<string[]> {

    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity) {
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

  @ApiOperation({ summary: 'Obtener actividades vistas por un usuario', description: 'Obtiene las actividades vistas por un usuario' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })

  @ApiParam({
    name: 'id',
    example: 'auth0|64479d486f7ef1ea7854bcab',
    description: 'ID de un usuario',
    required: true,
  })

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


  /*-------------------------------------- POST --------------------------------------*/

  @Post()

  @ApiOperation({ summary: 'Crear actividad', description: 'Crea una actividad' })
  @ApiResponse({ status: 201, description: 'Actividad creada correctamente' })
  @ApiResponse({ status: 400, description: 'Error en la solicitud' })
  @ApiResponse({ status: 401, description: 'Acceso no autorizado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Título de la actividad'
        },
        content: {
          type: 'string',
          example: 'Contenido de la actividad'
        },
        type: {
          type: 'string',
          example: 'Text'
        }
      }
    }
  })

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

  @ApiOperation({ summary: 'Marcar actividad como vista', description: 'Marca una actividad como vista por el usuario autenticado' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })

  @ApiParam({
    name: 'id',
    description: 'ID de una actividad',
    required: true,
  })

  async markActivityAsViewed(@Param('id') id: string, @Req() request: Request): Promise<void> {
    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity) {
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


  /*-------------------------------------- PUT --------------------------------------*/

  @Put(':id')

  @ApiOperation({ summary: 'Actualizar actividad', description: 'Actualiza una actividad por ID' })
  @ApiResponse({ status: 200, description: 'Actividad actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Error en la solicitud' })
  @ApiResponse({ status: 401, description: 'Acceso no autorizado' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })

  @ApiParam({
    name: 'id',
    description: 'ID de la actividad',
    required: true,
  })

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Título de la actividad'
        },
        content: {
          type: 'string',
          example: 'Contenido de la actividad'
        },
        type: {
          type: 'string',
          example: 'Text'
        },
      }
    }

  })


  async updateActivity(@Param('id') id: string, @Body() activityData: Partial<Activity>, @Req() request: Request): Promise<{ status: HttpStatus, message: string }> {

    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity) {
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


  /*-------------------------------------- DELETE --------------------------------------*/

  @Delete(':id')

  @ApiOperation({ summary: 'Eliminar actividad', description: 'Elimina una actividad por ID' })
  @ApiResponse({ status: 200, description: 'Actividad eliminada correctamente' })
  @ApiResponse({ status: 401, description: 'Acceso no autorizado' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })

  @ApiParam({
    name: 'id',
    description: 'ID de la actividad',
    required: true,
  })

  async deleteActivity(@Param('id') id: string, @Req() request: Request): Promise<{ status: HttpStatus, message: string }> {
    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity) {
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


  @Patch('answer/:id')

  @ApiOperation({ summary: 'Verificar la respuesta de un estudiante a la actividad', description: 'Verifica la respuesta de un estudiante a la actividad y devuelve si es correcta o no' })
  @ApiResponse({ status: 200, description: 'OK', type: Boolean })
  @ApiResponse({ status: 400, description: 'Cuerpo de la petición mal formado' })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })

  @ApiParam({
    name: 'id',
    description: 'ID de la actividad',
    required: true,
  })

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        answer: {
          type: 'string',
          example: 'Respuesta del estudiante'
        }
      }
    }
  })

  async checkAnswer(@Param('id') id: string, @Body() body: Partial<any>): Promise<{ status: HttpStatus, isCorrect: boolean }> {

    if (!body.answer) {
      throw new BadRequestException('Cuerpo de la petición mal formado')
    }

    // Check if the activity exists
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity) {
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