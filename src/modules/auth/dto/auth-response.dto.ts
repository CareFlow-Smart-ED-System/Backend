import { Exclude } from 'class-transformer';

export class AuthResponseDto {
  id: string;
  email: string;
  displayName: string;
  role: string;

  @Exclude()
  passwordHash?: string;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthResponseDto;
}

export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
}
