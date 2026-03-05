import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AdminUserListItem,
  AdminUpdateUserRequest,
  BootstrapAdminRequest,
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  AppRole,
  LoginRequest,
  LoginResponse,
} from '@packtrack/shared';
import { compare, hash } from 'bcryptjs';
import { SignOptions, verify as jwtVerify, sign as jwtSign } from 'jsonwebtoken';
import { SupabaseService } from '../supabase/supabase.service';

const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;

type TokenType = 'access' | 'refresh';

interface TokenPayload {
  sub: string;
  username: string;
  role: AppRole;
  type: TokenType;
}

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: AppRole;
  is_active: boolean;
}

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const username = this.normalizeUsername(payload.username);
    this.validateUsername(username);

    const user = await this.getUserByUsername(username);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const passwordMatch = await compare(payload.password, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const payload = this.verifyToken(refreshToken, 'refresh');
    const user = await this.getUserByUsername(payload.username);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User is inactive or missing.');
    }

    return this.issueTokens(user);
  }

  async adminCreateUser(
    requesterId: string | undefined,
    payload: AdminCreateUserRequest,
  ): Promise<AdminCreateUserResponse> {
    if (!requesterId) {
      throw new UnauthorizedException('Missing authenticated user.');
    }

    const requester = await this.getUserById(requesterId);
    if (!requester || !requester.is_active) {
      throw new UnauthorizedException('Invalid authenticated user.');
    }

    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can create users.');
    }

    const username = this.normalizeUsername(payload.username);
    this.validateUsername(username);

    const existingUser = await this.getUserByUsername(username);
    if (existingUser) {
      throw new BadRequestException('Username already exists.');
    }

    const passwordHash = await hash(payload.password, 12);

    const { data, error } = await this.supabaseService.client
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        role: payload.role,
        is_active: true,
      })
      .select('id, username, role')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(error?.message ?? 'Failed to create user.');
    }

    return {
      id: data.id as string,
      username: data.username as string,
      role: data.role as AppRole,
    };
  }

  async listAdminUsers(requesterId: string | undefined): Promise<AdminUserListItem[]> {
    if (!requesterId) {
      throw new UnauthorizedException('Missing authenticated user.');
    }

    const requester = await this.getUserById(requesterId);
    if (!requester || !requester.is_active) {
      throw new UnauthorizedException('Invalid authenticated user.');
    }

    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can list users.');
    }

    const { data, error } = await this.supabaseService.client
      .from('users')
      .select('id, username, role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as AdminUserListItem[];
  }

  async updateAdminUser(
    requesterId: string | undefined,
    userId: string,
    payload: AdminUpdateUserRequest,
  ): Promise<AdminUserListItem> {
    const requester = await this.requireAdmin(requesterId);

    const username = this.normalizeUsername(payload.username);
    this.validateUsername(username);

    const targetUser = await this.getUserById(userId);
    if (!targetUser) {
      throw new BadRequestException('User not found.');
    }

    const existingUser = await this.getUserByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Username already exists.');
    }

    if (requester.id === userId && payload.role !== 'admin') {
      throw new BadRequestException('You cannot remove your own admin role.');
    }

    const updatePayload: Record<string, unknown> = {
      username,
      role: payload.role,
      is_active: payload.is_active,
    };

    if (payload.password && payload.password.trim().length > 0) {
      updatePayload.password_hash = await hash(payload.password.trim(), 12);
    }

    const { data, error } = await this.supabaseService.client
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('id, username, role, is_active, created_at')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(error?.message ?? 'Failed to update user.');
    }

    return data as AdminUserListItem;
  }

  async deleteAdminUser(requesterId: string | undefined, userId: string): Promise<void> {
    const requester = await this.requireAdmin(requesterId);

    if (requester.id === userId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    const { error } = await this.supabaseService.client.from('users').delete().eq('id', userId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async bootstrapAdmin(payload: BootstrapAdminRequest): Promise<LoginResponse> {
    const username = this.normalizeUsername(payload.username);
    this.validateUsername(username);

    const { count, error: countError } = await this.supabaseService.client
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      throw new InternalServerErrorException(countError.message);
    }

    if ((count ?? 0) > 0) {
      throw new ForbiddenException('Bootstrap is disabled: users already exist.');
    }

    const passwordHash = await hash(payload.password, 12);
    const { data, error } = await this.supabaseService.client
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
      })
      .select('id, username, password_hash, role, is_active')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(error?.message ?? 'Failed to bootstrap admin user.');
    }

    return this.issueTokens(data as UserRow);
  }

  private async getUserByUsername(username: string): Promise<UserRow | null> {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .select('id, username, password_hash, role, is_active')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data as UserRow | null) ?? null;
  }

  private async getUserById(id: string): Promise<UserRow | null> {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .select('id, username, password_hash, role, is_active')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data as UserRow | null) ?? null;
  }

  private async requireAdmin(requesterId: string | undefined): Promise<UserRow> {
    if (!requesterId) {
      throw new UnauthorizedException('Missing authenticated user.');
    }

    const requester = await this.getUserById(requesterId);
    if (!requester || !requester.is_active) {
      throw new UnauthorizedException('Invalid authenticated user.');
    }

    if (requester.role !== 'admin') {
      throw new ForbiddenException('Only admins can perform this action.');
    }

    return requester;
  }

  private issueTokens(user: UserRow): LoginResponse {
    const accessExpiry =
      user.role === 'client'
        ? (process.env.JWT_CLIENT_ACCESS_EXPIRES_IN ?? '30d')
        : (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m');

    const accessToken = this.signToken(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        type: 'access',
      },
      { expiresIn: accessExpiry as SignOptions['expiresIn'] },
    );

    const refreshToken = this.signToken(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        type: 'refresh',
      },
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '30d') as SignOptions['expiresIn'] },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  private verifyToken(token: string, expectedType: TokenType): TokenPayload {
    const secret = this.getJwtSecret();

    let payload: unknown;
    try {
      payload = jwtVerify(token, secret);
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    if (!payload || typeof payload !== 'object') {
      throw new UnauthorizedException('Invalid token payload.');
    }

    const parsed = payload as Partial<TokenPayload>;
    if (
      !parsed.sub ||
      !parsed.username ||
      !parsed.role ||
      !parsed.type ||
      parsed.type !== expectedType
    ) {
      throw new UnauthorizedException('Invalid token payload.');
    }

    return parsed as TokenPayload;
  }

  private signToken(payload: TokenPayload, options: SignOptions): string {
    const secret = this.getJwtSecret();
    return jwtSign(payload, secret, options);
  }

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET is missing.');
    }
    return secret;
  }

  private validateUsername(username: string): void {
    if (!USERNAME_REGEX.test(username)) {
      throw new BadRequestException(
        'Username must be 3-30 characters and contain only letters, numbers, dot, underscore, or dash.',
      );
    }
  }

  private normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
  }
}
