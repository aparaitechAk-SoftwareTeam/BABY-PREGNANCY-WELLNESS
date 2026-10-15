import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(credentials: any) {
    return { token: 'sample-jwt-token', user: { email: credentials.email, role: 'admin' } };
  }
}
