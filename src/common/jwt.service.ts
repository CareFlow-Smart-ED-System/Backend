import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Secret, SignOptions } from 'jsonwebtoken';

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
    this.secret = this.configService.get<string>('JWT_SECRET');
    this.expiresIn = this.configService.get<string>('JWT_EXPIRATION') || '15m';
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    this.refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
  }

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret as Secret, {
      expiresIn: this.expiresIn as any, // Use the class property instead of hardcoded '1h'
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshSecret as Secret, {
      expiresIn: this.refreshExpiresIn as any, // Fixed typo: 'ih' -> refreshExpiresIn property
    });
  }

  verifyToken(token: string): JwtPayload {
    // Cast secret to Secret to avoid type mismatch
    return jwt.verify(token, this.secret as Secret) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret as Secret) as JwtPayload;
  }

  decodeToken(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload;
  }
}