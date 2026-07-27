import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Cowork';

  isMobileMenuOpen = signal(false);

  menuItems = [
    { name: 'Dashboard', icon: '📊', route: '/dashboard' },
    { name: 'Ingresos', icon: '📈', route: '/ingresos' },
    { name: 'Clientes', icon: '👥', route: '/clientes' },
    { name: 'Ajustes', icon: '⚙️', route: '/configuracion' },
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
