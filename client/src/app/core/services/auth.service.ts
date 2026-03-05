import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  AdminCreateUserRequest,
  AdminCreateUserResponse,
  LoginRequest,
  LoginResponse,
} from '@packtrack/shared';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const AUTH_STORAGE_KEY = 'packtrack_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<LoginResponse | null>(this.readSession());
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((response) => {
        this.session.set(response);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
      }),
    );
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  adminCreateUser(payload: AdminCreateUserRequest): Observable<AdminCreateUserResponse> {
    const token = this.session()?.accessToken;
    if (!token) {
      throw new Error('No active session.');
    }

    return this.http.post<AdminCreateUserResponse>(`${this.baseUrl}/admin/users`, payload, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }

  private readSession(): LoginResponse | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
}
