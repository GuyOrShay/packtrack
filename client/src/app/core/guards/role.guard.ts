import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole } from '@packtrack/shared';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const session = authService.session();
  if (!session) {
    void router.navigate(['/login']);
    return false;
  }

  const allowedRoles = (route.data?.['roles'] as AppRole[] | undefined) ?? [];
  if (allowedRoles.length === 0) {
    return true;
  }

  if (session.user.role && allowedRoles.includes(session.user.role)) {
    return true;
  }

  const role = session.user.role;
  if (role === 'admin') {
    void router.navigate(['/admin']);
  } else if (role === 'driver') {
    void router.navigate(['/driver']);
  } else if (role === 'client') {
    void router.navigate(['/client']);
  } else {
    void router.navigate(['/login']);
  }
  return false;
};
