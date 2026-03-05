import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '@packtrack/shared';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-clients.component.html',
  styleUrl: './admin-clients.component.css',
})
export class AdminClientsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly authService = inject(AuthService);

  readonly clients = signal<Client[]>([]);
  readonly message = signal('');
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    company_name: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    this.loadClients();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.message.set('');
    this.error.set('');

    const { company_name, username, password } = this.form.getRawValue();

    this.authService.adminCreateUser({ username, password, role: 'client' }).subscribe({
      next: (createdUser) => {
        this.clientService
          .createClient({
            company_name: company_name.trim(),
            username: username.trim(),
          })
          .subscribe({
            next: (createdClient) => {
              this.message.set(
                `Created client "${createdClient.company_name}" (${createdClient.contact_email}). Send credentials: ${createdUser.username} / ${password}`,
              );
              this.form.patchValue({
                company_name: '',
                username: '',
                password: '',
              });
              this.loadClients();
            },
            error: (err: { error?: { message?: string } }) => {
              this.error.set(
                `User created (${createdUser.username}) but client row failed: ${err?.error?.message ?? 'unknown error.'}`,
              );
            },
          });
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Failed to create client user.');
      },
    });
  }

  private loadClients(): void {
    this.clientService.listClients().subscribe((rows) => this.clients.set(rows));
  }
}
