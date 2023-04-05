import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

//   async validate(token: string): Promise<any> {
//     const user = await this.authService.validateToken(token);
//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
}
