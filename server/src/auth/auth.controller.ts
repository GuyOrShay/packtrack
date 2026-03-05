import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  BootstrapAdminRequest,
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
} from '@packtrack/shared';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() payload: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(payload);
  }

  @Post('refresh')
  refresh(@Body() payload: RefreshTokenRequest): Promise<LoginResponse> {
    return this.authService.refresh(payload.refreshToken);
  }

  @Post('bootstrap-admin')
  bootstrapAdmin(@Body() payload: BootstrapAdminRequest): Promise<LoginResponse> {
    return this.authService.bootstrapAdmin(payload);
  }

  @Post('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminCreateUser(
    @Body() payload: AdminCreateUserRequest,
  ): Promise<AdminCreateUserResponse> {
    return this.authService.adminCreateUser(payload);
  }
}
