// auth/auth0.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { auth } from 'express-oauth2-jwt-bearer';
import axios from 'axios';

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

// Return token with full access to auth0 api
export async function auth0Access() {
  const data = {
      "client_id": process.env.CLIENT_ID,
      "client_secret": process.env.CLIENT_SECRET,
      "audience": process.env.AUDIENCE,
      "grant_type": process.env.GRANT_TYPE
  };
  const config = {
      headers: {
          'Content-Type': 'application/json'
      }
  };
  try {
      const response = await axios.post('https://fct-netex.eu.auth0.com/oauth/token', data, config);
      return response.data.access_token;
  } catch (error) {
      console.log(error);
      throw new Error('Error');
  }
}