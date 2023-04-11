// ./auth/auth.controller.ts
import { Controller, Post, Request, Response, UseGuards, Get } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response({ passthrough: true }) res) {
    const jwt = await this.authService.login(req.user);
    res.cookie('Authorization', `Bearer ${jwt.access_token}`, {
      httpOnly: true,
    });
    return { message: 'Login successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtectedData(@Request() req) {
    return { message: 'This is protected data', user: req.user };
  }
}