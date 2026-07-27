import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  menuItems = [
    { name: 'Dashboard', icon: '📊', route: '/dashboard' },
    { name: 'Ingresos', icon: '📈', route: '/ingresos' },
    { name: 'Clientes', icon: '👥', route: '/clientes' },
    { name: 'Configuración', icon: '⚙️', route: '/configuracion' },
  ];
}
