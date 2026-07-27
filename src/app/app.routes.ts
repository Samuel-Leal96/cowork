import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Ingresos } from './pages/ingresos/ingresos';
import { Clientes } from './pages/clientes/clientes';
import { Configuracion } from './pages/configuracion/configuracion';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'ingresos', component: Ingresos },
  { path: 'clientes', component: Clientes },
  { path: 'configuracion', component: Configuracion },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
