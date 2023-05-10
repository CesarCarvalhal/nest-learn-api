// ./users/user.controller.ts
import { Controller, Get, Patch, UseGuards, Res, Req, Body } from '@nestjs/common';
import { Auth0Guard, auth0Access } from '../auth/auth0.guard';
import { Response, Request } from 'express';
import axios from 'axios';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Usuarios')
@ApiBearerAuth()

@Controller('users')
@UseGuards(Auth0Guard)
export class UserController {

  // Extrac token
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }


  /*-------------------------------------- REQUESTS --------------------------------------*/

  @Patch('update-nickname')

  @ApiOperation({summary: 'Actualizar nickname del usuario autenticado', description: 'Actualiza el nickname del usuario autenticado en Auth0'})

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nickname: {
          type: 'string',
          example: 'nickname'
        }
      }
    }
  })

  async updateNickname( @Req() req: Request, @Res() res: Response, @Body('nickname') newnickname: string,): Promise<any> {
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



  @Get("roles")

  @ApiOperation({ summary: 'Obtener roles del usuario autenticado', description: 'Obtiene los roles del usuario autenticado en Auth0'})

  async test( @Req() req: Request, @Res() res: Response): Promise<any> {

    // Get user ID
    const userIdResponse = await axios.get('https://fct-netex.eu.auth0.com/userinfo', {
      headers: {
        Authorization: `Bearer ${this.extractTokenFromHeader(req)}`,
      },
    });
    const userId = userIdResponse.data;

    // Get user roles
    const userRolesResponse = await axios.get('https://fct-netex.eu.auth0.com/api/v2/users/' + encodeURIComponent(userId.sub) + '/roles', {
      headers: {
        Authorization: `Bearer ${await auth0Access()}`,
      },
    });
    const userRoles = userRolesResponse.data;

    return res.status(200).json({ roles: userRoles });
  }

}