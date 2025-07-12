// src/app/pages/cities/cities.component.ts - Version using ApiService
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { ApiService } from '../../core/services/api.service';
import { City } from '../../core/models/city.model';

@Component({
  selector: 'app-cities',
  imports: [
    RouterLink,
    ButtonModule,
    CardModule,
    SkeletonModule,
    InputTextModule,
    TagModule,
    BadgeModule
  ],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss'
})
export default class CitiesComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Angular 19 signals
  cities = signal<City[]>([]);
  filteredCities = signal<City[]>([]);
  loading = signal(true);
  searchTerm = signal('');

  skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8];

  ngOnInit() {
    this.loadCities();
  }

  loadCities() {
    this.loading.set(true);
    
    this.apiService.getAllCities().subscribe({
      next: (cities: City[]) => {
        console.log('Cities loaded via API service:', cities);
        
        // The API service now handles the response structure,
        // so we get the cities array directly
        this.cities.set(cities);
        this.filteredCities.set(cities);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.cities.set([]);
        this.filteredCities.set([]);
        this.loading.set(false);
      }
    });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const searchValue = target.value.toLowerCase();
    this.searchTerm.set(searchValue);
    this.filterCities();
  }

  filterCities() {
    const term = this.searchTerm().toLowerCase();
    
    if (!term) {
      this.filteredCities.set(this.cities());
      return;
    }

    const filtered = this.cities().filter(city => 
      city.name.toLowerCase().includes(term) ||
      (city.description && city.description.toLowerCase().includes(term)) ||
      (city.region && city.region.toLowerCase().includes(term))
    );

    this.filteredCities.set(filtered);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.filteredCities.set(this.cities());
  }

  navigateToCity(cityId: number) {
    this.router.navigate(['/destinations'], { 
      queryParams: { city: cityId } 
    });
  }

  getCityImage(city: City): string | null {
    return city.image || city.imageUrl || null;
  }

  getCityFeatures(city: City): string[] {
    const features: string[] = [];
    
    if (city.isPopular) {
      features.push('Popular');
    }
    
    if (city.region) {
      features.push(city.region);
    }
    
    // Add features based on city name
    switch (city.name.toLowerCase()) {
      case 'marrakech':
        features.push('Imperial City', 'Medina', 'Souks');
        break;
      case 'casablanca':
        features.push('Modern', 'Business Hub', 'Hassan II Mosque');
        break;
      case 'fez':
        features.push('Cultural Capital', 'Ancient University', 'Crafts');
        break;
      case 'chefchaouen':
        features.push('Blue City', 'Mountains', 'Photography');
        break;
      case 'essaouira':
        features.push('Coastal', 'Windsurfing', 'Portuguese Architecture');
        break;
      case 'agadir':
        features.push('Beach Resort', 'Atlantic Coast', 'Modern');
        break;
      case 'tangier':
        features.push('Gateway to Europe', 'Multicultural', 'Port City');
        break;
      case 'rabat':
        features.push('Capital', 'Royal City', 'Administrative');
        break;
      case 'meknes':
        features.push('Imperial City', 'Historic Gates', 'Monuments');
        break;
      case 'ouarzazate':
        features.push('Desert Gateway', 'Film Studios', 'Kasbahs');
        break;
      default:
        features.push('Historic', 'Culture');
    }
    
    return features;
  }

  trackByCity(index: number, city: City): number {
    return city.id;
  }
}