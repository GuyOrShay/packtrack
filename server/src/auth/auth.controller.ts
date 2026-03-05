import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import {
  AdminUserListItem,
  AdminUpdateUserRequest,
  BootstrapAdminRequest,
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
} from '@packtrack/shared';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

interface AuthenticatedRequest {
  user?: {
    sub: string;
  };
}

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
  @UseGuards(JwtAuthGuard)
  adminCreateUser(
    @Req() req: AuthenticatedRequest,
    @Body() payload: AdminCreateUserRequest,
  ): Promise<AdminCreateUserResponse> {
    return this.authService.adminCreateUser(req.user?.sub, payload);
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard)
  listAdminUsers(@Req() req: AuthenticatedRequest): Promise<AdminUserListItem[]> {
    return this.authService.listAdminUsers(req.user?.sub);
  }

  @Patch('admin/users/:id')
  @UseGuards(JwtAuthGuard)
  updateAdminUser(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() payload: AdminUpdateUserRequest,
  ): Promise<AdminUserListItem> {
    return this.authService.updateAdminUser(req.user?.sub, id, payload);
  }

  @Delete('admin/users/:id')
  @UseGuards(JwtAuthGuard)
  deleteAdminUser(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    return this.authService.deleteAdminUser(req.user?.sub, id);
  }
}
