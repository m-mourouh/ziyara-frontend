// src/app/app.component.ts - Fixed version
import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MenubarModule,
    ButtonModule,
    SidebarModule,
    ToastModule,
    // ConfirmDialogModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export default class AppComponent {
  private router = inject(Router);

  // Angular 19 signals
  sidebarVisible = signal(false);
  
  menuItems = signal<MenuItem[]>([
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/'
    },
    {
      label: 'Destinations',
      icon: 'pi pi-compass',
      routerLink: '/destinations'
    },
    {
      label: 'Cities',
      icon: 'pi pi-map',
      routerLink: '/cities'
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      routerLink: '/about'
    }
  ]);
}