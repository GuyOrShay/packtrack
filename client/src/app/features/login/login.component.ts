import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppRole } from '@packtrack/shared';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid || this.isLoading()) {
      this.form.markAllAsTouched();
      if (this.form.controls.username.invalid) {
        this.errorMessage.set('Username must contain at least 3 characters.');
      } else if (this.form.controls.password.invalid) {
        this.errorMessage.set('Password must contain at least 6 characters.');
      }
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        const role = response.user.role;
        if (!role) {
          this.errorMessage.set('User role is missing. Contact administrator.');
          return;
        }

        void this.router.navigate([this.routeForRole(role)]);
      },
      error: (error: { error?: { message?: string } }) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Login failed. Please try again.');
      },
    });
  }

  private routeForRole(role: AppRole): string {
    if (role === 'admin') {
      return '/admin';
    }
    if (role === 'driver') {
      return '/driver';
    }
    return '/client';
  }
}
