import { Injectable } from '@nestjs/common';
// import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    // private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

//   async validateUser(username: string, pass: string): Promise<any> {
//     const user = await this.usersService.findOne(username);
//     if (user && bcrypt.compareSync(pass, user.password)) {
//       return user;
//     }
//     return null;
//   }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
