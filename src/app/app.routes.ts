// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component')
  },
  {
    path: 'cities',
    loadComponent: () => import('./pages/cities/cities.component')
  },
  {
    path: 'destinations',
    loadComponent: () => import('./pages/destinations/destinations.component')
  },
  {
    path: 'destinations/:id',
    loadComponent: () => import('./pages/destination-detail/destination-detail.component')
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.component')
  },
  {
    path: '**',
    redirectTo: ''
  }
];