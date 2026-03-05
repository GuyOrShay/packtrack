import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminUpdateUserRequest, AdminUserListItem, AppRole } from '@packtrack/shared';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-clients.component.html',
  styleUrl: './admin-clients.component.css',
})
export class AdminClientsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly users = signal<AdminUserListItem[]>([]);
  readonly isLoadingUsers = signal(true);
  readonly message = signal('');
  readonly error = signal('');
  readonly popupOpen = signal(false);
  readonly menuUserId = signal<string | null>(null);
  readonly editPopupOpen = signal(false);
  readonly editingUserId = signal<string | null>(null);

  readonly addUserForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['driver' as AppRole, [Validators.required]],
  });

  readonly editUserForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: [''],
    role: ['driver' as AppRole, [Validators.required]],
    is_active: [true],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  openPopup(): void {
    this.message.set('');
    this.error.set('');
    this.popupOpen.set(true);
  }

  closePopup(): void {
    this.popupOpen.set(false);
  }

  toggleRowMenu(userId: string): void {
    this.menuUserId.update((current) => (current === userId ? null : userId));
  }

  openEditUser(user: AdminUserListItem): void {
    this.menuUserId.set(null);
    this.editingUserId.set(user.id);
    this.editUserForm.patchValue({
      username: user.username,
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
    this.editPopupOpen.set(true);
  }

  closeEditPopup(): void {
    this.editPopupOpen.set(false);
    this.editingUserId.set(null);
  }

  submitUser(): void {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      return;
    }

    this.message.set('');
    this.error.set('');

    const payload = this.addUserForm.getRawValue();
    this.authService.adminCreateUser(payload).subscribe({
      next: (createdUser) => {
        this.message.set(`User created: ${createdUser.username} (${createdUser.role})`);
        this.addUserForm.patchValue({ username: '', password: '', role: 'driver' as AppRole });
        this.popupOpen.set(false);
        this.loadUsers();
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Failed to create user.');
      },
    });
  }

  submitEditUser(): void {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    const userId = this.editingUserId();
    if (!userId) {
      return;
    }

    this.message.set('');
    this.error.set('');

    const raw = this.editUserForm.getRawValue();
    const payload: AdminUpdateUserRequest = {
      username: raw.username.trim(),
      role: raw.role,
      is_active: raw.is_active,
      password: raw.password.trim() || undefined,
    };

    this.authService.updateAdminUser(userId, payload).subscribe({
      next: (updatedUser) => {
        this.message.set(`User updated: ${updatedUser.username}`);
        this.closeEditPopup();
        this.loadUsers();
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Failed to update user.');
      },
    });
  }

  deleteUser(user: AdminUserListItem): void {
    this.menuUserId.set(null);
    if (!confirm(`Delete user ${user.username}?`)) {
      return;
    }

    this.message.set('');
    this.error.set('');

    this.authService.deleteAdminUser(user.id).subscribe({
      next: () => {
        this.message.set(`User deleted: ${user.username}`);
        this.loadUsers();
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Failed to delete user.');
      },
    });
  }

  private loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.authService.listAdminUsers().subscribe({
      next: (rows) => {
        this.users.set(rows);
        this.isLoadingUsers.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Failed to load users.');
        this.isLoadingUsers.set(false);
      },
    });
  }
}
