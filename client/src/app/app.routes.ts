import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AdminClientsComponent } from './features/admin-clients/admin-clients.component';
import { AdminDeliveriesComponent } from './features/admin-deliveries/admin-deliveries.component';
import { AdminReportsComponent } from './features/admin-reports/admin-reports.component';
import { AdminViewComponent } from './features/admin-view/admin-view.component';
import { ClientViewComponent } from './features/client-view/client-view.component';
import { DriverViewComponent } from './features/driver-view/driver-view.component';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'client',
    component: ClientViewComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['client'] },
  },
  {
    path: 'driver',
    component: DriverViewComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['driver'] },
  },
  {
    path: 'admin',
    component: AdminViewComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/clients',
    component: AdminClientsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/deliveries',
    component: AdminDeliveriesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/reports',
    component: AdminReportsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  { path: '**', redirectTo: 'login' },
];
