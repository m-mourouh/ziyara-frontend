// src/app/pages/search/search.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-search',
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="text-center">
        <i class="pi pi-search text-6xl text-gray-400 mb-6"></i>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Search Coming Soon</h1>
        <p class="text-gray-600 mb-8">Advanced search functionality will be available here.</p>
        <p-button 
          label="Back to Home"
          icon="pi pi-home"
          routerLink="/">
        </p-button>
      </div>
    </div>
  `
})
export default class SearchComponent {}