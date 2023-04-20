// auth/auth0.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { auth } from 'express-oauth2-jwt-bearer';

@Injectable()
export class Auth0Guard implements CanActivate {
  private checkJwt: ReturnType<typeof auth>;

  constructor(private readonly reflector: Reflector) {
    this.checkJwt = auth({
      audience: 'https://fct-netex.eu.auth0.com/api/v2/',
      issuerBaseURL: 'https://fct-netex.eu.auth0.com/',
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const done = (error?: any, result?: boolean) => {
      if (error) {
        throw error;
      }
      return result;
    };

    await this.checkJwt(request, response, done);
    return true;
  }
}