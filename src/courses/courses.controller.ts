// courses.controller.ts
import { Controller, Post, Get, Req, Delete, Param, Body, UseGuards, NotFoundException, UnauthorizedException, BadRequestException, HttpException, HttpStatus, Put } from '@nestjs/common';
import { ActivitiesService } from 'src/activities/activities.service';
import { CourseService } from './courses.service';
import { Course } from './courses.schema';
import { Auth0Guard, auth0Access } from 'src/auth/auth0.guard';
import axios from 'axios';
import { Request } from 'express';
import { Activity } from 'src/activities/activities.schema';

@Controller('rest/courses')
@UseGuards(Auth0Guard)
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
        private readonly activitiesService: ActivitiesService
    ) { }

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
            throw new HttpException('Usuario no autorizado', HttpStatus.FORBIDDEN);
        }
    }


    // POSTS

    @Post()
    async createCourse(@Req() request: Request, @Body() courseData: Course): Promise<{ status: HttpStatus, message: string }> {
        try {
            const token = this.extractTokenFromHeader(request);
            const user = await this.getUserFromToken(token);
            await this.verifyUserIsAdmin(user.sub);

            if (!courseData.title) {
                throw new HttpException('Título del curso necesario', HttpStatus.BAD_REQUEST,);
            }

            await this.courseService.createCourse(courseData, user.sub);
            return { status: HttpStatus.CREATED, message: 'Curso creado correctamente' };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Post(':courseId/activities/:activityId')
    async addActivityToCourse(@Req() request: Request, @Param('courseId') courseId: string, @Param('activityId') activityId: string): Promise<{ status: HttpStatus, message: string }> {
        try {
            const token = this.extractTokenFromHeader(request);
            const user = await this.getUserFromToken(token);
            await this.verifyUserIsAdmin(user.sub);

            const course = await this.courseService.getCourseById(courseId);
            if (!course) {
                throw new HttpException('Curso no encontrado', HttpStatus.NOT_FOUND);
            }

            if (course.activities.some(activity => activity.toString() === activityId)) {
                throw new HttpException('La actividad ya se encuentra en el curso', HttpStatus.BAD_REQUEST);
            }

            const activity = await this.activitiesService.getActivityById(activityId);
            if (!activity) {
                throw new HttpException('Actividad no encontrada', HttpStatus.NOT_FOUND);
            }

            await this.courseService.addActivityToCourse(courseId, activityId);
            return { status: HttpStatus.OK, message: 'Actividad añadida correctamente' };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    // GETS

    @Get()
    async getAllCourses(): Promise<Course[]> {
        try {
            return await this.courseService.getAllCourses();
        } catch (error) {
            throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async getCourseById(@Param('id') id: string): Promise<Course> {
        try {
            const course = await this.courseService.getCourseById(id);
            if (!course) {
                throw new HttpException('Curso no encontrado', HttpStatus.NOT_FOUND,);
            }
            return course;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Get(':id/activities')
    async getActivitiesByCourseId(@Param('id') id: string): Promise<Activity[]> {
        try {
            const course = await this.courseService.getCourseById(id);
            if (!course) {
                throw new HttpException('Curso no encontrado', HttpStatus.NOT_FOUND);
            }
            const activitiesCourse = [];
            for (const activityId of course.activities) {
                const activity = await this.activitiesService.getActivityById(activityId);
                activitiesCourse.push(activity);
            }
            return activitiesCourse;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }




    // PUTS

    @Put(':id')
    async updateCourseById(@Req() request: Request, @Param('id') id: string, @Body() courseData: Course): Promise<{ status: HttpStatus, message: string }> {
        try {
            const token = this.extractTokenFromHeader(request);
            const user = await this.getUserFromToken(token);
            await this.verifyUserIsAdmin(user.sub);

            const course = await this.courseService.getCourseById(id);
            if (!course) {
                throw new HttpException('Curso no encontrado', HttpStatus.NOT_FOUND,);
            }

            if (!courseData.title) {
                throw new HttpException('Título del curso necesario', HttpStatus.BAD_REQUEST,);
            }

            await this.courseService.updateCourseById(id, courseData);
            return { status: HttpStatus.OK, message: 'Curso actualizado correctamente' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    // DELETES

    @Delete(':id')
    async deleteCourseById(@Req() request: Request, @Param('id') id: string): Promise<{ status: HttpStatus, message: string }> {
        try {
            const token = this.extractTokenFromHeader(request);
            const user = await this.getUserFromToken(token);
            await this.verifyUserIsAdmin(user.sub);

            const course = await this.courseService.getCourseById(id);
            if (!course) {
                throw new HttpException('Curso no encontrado', HttpStatus.NOT_FOUND,);
            }

            await this.courseService.deleteCourseById(id);
            return { status: HttpStatus.OK, message: 'Curso eliminado correctamente' };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Delete(':courseId/activities/:activityId')
    async removeActivityFromCourse(@Req() request: Request, @Param('courseId') courseId: string, @Param('activityId') activityId: string): Promise<{ status: HttpStatus, message: string }> {
        try {
            const token = this.extractTokenFromHeader(request);
            const user = await this.getUserFromToken(token);
            await this.verifyUserIsAdmin(user.sub);

            const course = await this.courseService.getCourseById(courseId);
            if (!course) {
                throw new HttpException('Curso no encontrado', HttpStatus.NOT_FOUND,);
            }

            await this.courseService.removeActivityFromCourse(courseId, activityId);
            return { status: HttpStatus.OK, message: 'Actividad eliminada correctamente del curso' };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}