import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { PasswordService } from '@common/password.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginResponseDto, TokenResponseDto } from './dto/auth-response.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ConfigService } from '@nestjs/config';

const LOGIN_LOCKOUT_THRESHOLD = 5;
const LOGIN_LOCKOUT_DURATION_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is temporarily locked. Please try again later.');
    }

    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verifyPassword(
      user.passwordHash,
      password,
    );

    if (!isPasswordValid) {
      const nextAttempts = user.failedLoginAttempts + 1;
      const isLocked = nextAttempts >= LOGIN_LOCKOUT_THRESHOLD;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: isLocked ? 0 : nextAttempts,
          lockedUntil: isLocked ? new Date(Date.now() + LOGIN_LOCKOUT_DURATION_MS) : null,
        },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, {
      revokeExistingTokens: true,
    });

    return {
      ...tokens,
      message: 'Login successful',
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        mustChangePassword: true,
        dateOfBirth: true,
        gender: true,
        doctor: {
          select: {
            specialization: true,
          },
        },
        nurse: {
          select: {
            department: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.id,
      displayName: user.displayName,
      email: user.email,
      gender: user.gender,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      ...(user.doctor?.specialization ? { specialization: user.doctor.specialization } : {}),
      ...(user.nurse?.department ? { department: user.nurse.department } : {}),
      dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }) as any;

      // Check if token is revoked
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.revokedAt) {
        throw new UnauthorizedException('Refresh token is invalid or revoked');
      }

      // Check expiration
      if (new Date(storedToken.expiresAt) < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens and rotate existing refresh tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role, {
        revokeExistingTokens: true,
      });

      return {
        ...tokens,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<any> {
    const { currentPassword, newPassword, newPasswordConfirm, confirmPassword } = updatePasswordDto;
    const passwordConfirmation = newPasswordConfirm || confirmPassword;

    // Verify password confirmation match
    if (newPassword !== passwordConfirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.passwordService.verifyPassword(
      user.passwordHash,
      currentPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await this.passwordService.hashPassword(newPassword);

    // Update password and set mustChangePassword to false
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false, // Password has been changed
      },
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const tokens = await this.generateTokens(
      updatedUser.id,
      updatedUser.email,
      updatedUser.role,
      { revokeExistingTokens: true },
    );

    return {
      message: 'Password updated successfully',
      ...tokens,
      user: {
        userId: updatedUser.id,
        displayName: updatedUser.displayName,
        role: updatedUser.role,
        mustChangePassword: false,
      },
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    options?: { revokeExistingTokens?: boolean },
  ): Promise<TokenResponseDto> {
    if (options?.revokeExistingTokens) {
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    // Generate access token
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
      },
      {
        expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
      },
    );

    // Generate refresh token
    const refreshTokenExpiration = this.configService.get(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        type: 'refresh',
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiration,
      },
    );

    // Store refresh token in database
    const expiresAt = this.getRefreshTokenExpiryDate(refreshTokenExpiration);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private getRefreshTokenExpiryDate(duration: string | number): Date {
    const expiresAt = new Date();
    const durationMs = this.parseDurationToMs(duration) ?? 7 * 24 * 60 * 60 * 1000;
    expiresAt.setTime(expiresAt.getTime() + durationMs);
    return expiresAt;
  }

  private parseDurationToMs(duration: string | number): number | undefined {
    if (typeof duration === 'number') {
      return duration * 1000;
    }

    const match = /^([0-9]+)(ms|s|m|h|d)$/.exec(duration);
    if (!match) {
      return undefined;
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
    };

    return value * multipliers[unit];
  }
}
