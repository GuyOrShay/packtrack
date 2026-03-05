import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly roleLabel = computed(() => {
    const role = this.authService.session()?.user.role;
    if (role === 'admin') return 'מנהל';
    if (role === 'driver') return 'נהג';
    if (role === 'client') return 'לקוח';
    return 'לא ידוע';
  });

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  goHome(): void {
    const role = this.authService.session()?.user.role;
    if (role === 'admin') {
      void this.router.navigate(['/admin']);
      return;
    }
    if (role === 'driver') {
      void this.router.navigate(['/driver']);
      return;
    }
    if (role === 'client') {
      void this.router.navigate(['/client']);
      return;
    }
    void this.router.navigate(['/login']);
  }
}
