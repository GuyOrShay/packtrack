import { Routes } from '@angular/router';
import { AdminViewComponent } from './features/admin-view/admin-view.component';
import { ClientViewComponent } from './features/client-view/client-view.component';
import { DriverViewComponent } from './features/driver-view/driver-view.component';

export const routes: Routes = [
  { path: '', redirectTo: 'client', pathMatch: 'full' },
  { path: 'client', component: ClientViewComponent },
  { path: 'driver', component: DriverViewComponent },
  { path: 'admin', component: AdminViewComponent },
];
