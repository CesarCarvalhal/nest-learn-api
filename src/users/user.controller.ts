// ./users/user.controller.ts
import { Controller, Get, Post, Put, Body, UseGuards, Param, Res, Req, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { Response, Request } from 'express';
import { Auth0Guard } from '../auth/auth0.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  /////////////////////////// GETS

  // all users
  @Get()
  @UseGuards(Auth0Guard)
  async getAllUsers(): Promise<User[]> {
    const users = await this.userService.getAllUsers();
    if (!users || users.length === 0) {
      throw new NotFoundException('No se encontraron usuarios');
    }
    return users;
  }

  // user by id
  @Get('id/:id')
  async getUserById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('El usuario no existe');
    }
    return user;
  }

  // userS by username
  @Get('username/:username')
  async getUsersByUsername(@Param('username') username: string): Promise<User[]> {
    const users = await this.userService.getUsersByUsername(username);
    if (!users) {
      throw new NotFoundException('El usuario no existe');
    }
    return users;
  }

  // user by email
  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<User> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('El usuario no existe');
    }
    return user;
  }

  // userS by role
  @Get('role/:role')
  async getUsersByRole(@Param('role') role: string): Promise<User[]> {
    const users = await this.userService.getUsersByRole(role);
    if (!users) {
      throw new NotFoundException('El usuario no existe');
    }
    return users;
  }



  /////////////////////////// POSTS

  // SignUp
  @Post()
  async createUser(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('role') role: string,
    @Body('password') password: string,
    @Res() res: Response
  ): Promise<any> {
    const { id, token } = await this.userService.signUp(username, email, role, password);
    res.cookie('userId', id.toString(), { httpOnly: true, sameSite: 'strict' });
    res.cookie('Authorization', token, { httpOnly: true, sameSite: 'strict' });
    return res.status(201).json({ message: 'User created successfully' });
  }

  // LogIn
  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: Response
  ): Promise<any> {
    const { id, token } = await this.userService.login(username, password);
    res.cookie('userId', id.toString(), { httpOnly: true, sameSite: 'strict' });
    res.cookie('Authorization', token, { httpOnly: true, sameSite: 'strict' });
    // return res.status(201).json({ message: 'Login successfully' });
    return res.status(200).json({ token: token});
  }



  /////////////////////////// PUTS

  // Update username
  @Put('update')
  async updateUser(@Req() req, @Body('username') username: string) {
    const auth_token = this.extractTokenFromHeader(req);
    const res = await this.userService.updateUser(auth_token, username);
    return res;
  }
}
