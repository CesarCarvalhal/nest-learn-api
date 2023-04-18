// ./users/user.controller.ts
import { Controller, Get, Patch, UseGuards, Res, Req, Body } from '@nestjs/common';
import { Auth0Guard, auth0Access } from '../auth/auth0.guard';
import { Response, Request } from 'express';
import axios from 'axios';

@Controller('users')
export class UserController {

  // Extrac token
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  ////////////////////// REQUESTS

  
  // Update-nickname
  @Patch('update-nickname')
  @UseGuards(Auth0Guard)
  async updateNickname(
    @Req() req: Request,
    @Res() res: Response,
    @Body('nickname') newnickname: string,
  ): Promise<any> {
    // Get user ID
    const userIdResponse = await axios.get('https://fct-netex.eu.auth0.com/userinfo', {
      headers: {
        Authorization: `Bearer ${this.extractTokenFromHeader(req)}`,
      },
    });
    const userId = userIdResponse.data;

    // Update user nickname
    const updateResponse = await axios.patch(
      `https://fct-netex.eu.auth0.com/api/v2/users/${encodeURIComponent(userId.sub)}`,
      { nickname: newnickname },
      {
        headers: {
          Authorization: `Bearer ${await auth0Access()}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return res.status(200).json({ message: 'Nickname updated', data: updateResponse.data });
  }
  


  // Get authenticated user roles
  @Get("roles")
  @UseGuards(Auth0Guard)
  async test(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<any> {

    // Get user ID
    const userIdResponse = await axios.get('https://fct-netex.eu.auth0.com/userinfo', {
      headers: {
        Authorization: `Bearer ${this.extractTokenFromHeader(req)}`,
      },
    });
    const userId = userIdResponse.data;

    // Get user roles
    const userRolesResponse = await axios.get('https://fct-netex.eu.auth0.com/api/v2/users/'+encodeURIComponent(userId.sub)+'/roles', {
      headers: {
        Authorization: `Bearer ${await auth0Access()}`,
      },
    });
    const userRoles = userRolesResponse.data;

    return res.status(200).json({ roles: userRoles });
  }

}