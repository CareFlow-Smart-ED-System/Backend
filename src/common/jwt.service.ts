import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
}

@Injectable()
export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get('JWT_SECRET');
    this.expiresIn = this.configService.get('JWT_EXPIRATION') || '15m';
    this.refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    this.refreshExpiresIn =
      this.configService.get('JWT_REFRESH_EXPIRATION') || '7d';
  }

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    } as any);
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    } as any);
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret) as JwtPayload;
  }

  decodeToken(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload;
  }
}
