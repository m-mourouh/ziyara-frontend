// src/app/pages/home/home.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Destination } from '../../core/models/destination.model';
import { City } from '../../core/models/city.model';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    ButtonModule,
    CardModule,
    SkeletonModule,
    TagModule,
    RatingModule,
    DecimalPipe,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // Angular 19 signals
  popularDestinations = signal<Destination[]>([]);
  featuredCities = signal<City[]>([]);
  popularLoading = signal(true);
  citiesLoading = signal(true);

  ngOnInit() {
    this.loadPopularDestinations();
    this.loadFeaturedCities();
  }

  /**
   * Load popular destinations from API
   */
  loadPopularDestinations() {
    this.popularLoading.set(true);
    
    this.apiService.getPopularDestinations(6).subscribe({
      next: (destinations) => {
        console.log('Popular destinations loaded:', destinations);
        this.popularDestinations.set(destinations);
        this.popularLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading popular destinations:', error);
        // Set empty array and stop loading on error
        this.popularDestinations.set([]);
        this.popularLoading.set(false);
      }
    });
  }

  /**
   * Load featured cities from API
   */
  loadFeaturedCities() {
    this.citiesLoading.set(true);
    
    this.apiService.getAllCities().subscribe({
      next: (cities) => {
        console.log('Cities loaded:', cities);
        // Take first 4 cities as featured, prioritize popular ones
        const featured = cities
          .sort((a, b) => {
            // Sort by popular first, then by name
            if (a.isPopular && !b.isPopular) return -1;
            if (!a.isPopular && b.isPopular) return 1;
            return a.name.localeCompare(b.name);
          })
          .slice(0, 4);
        
        this.featuredCities.set(featured);
        this.citiesLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        // Set empty array and stop loading on error
        this.featuredCities.set([]);
        this.citiesLoading.set(false);
      }
    });
  }

  /**
   * Get destination image URL
   */
  getDestinationImage(destination: Destination): string | null {
    if (destination.mainImage) {
      return destination.mainImage;
    }
    if (destination.images && destination.images.length > 0) {
      return destination.images[0];
    }
    return null;
  }

  /**
   * Get city image URL
   */
  getCityImage(city: City): string | null {
    return city.image || city.imageUrl || null;
  }

  /**
   * Navigate to specific destination detail page
   */
  navigateToDestination(id: number) {
    this.router.navigate(['/destinations', id]);
  }

  /**
   * Navigate to destinations filtered by city
   */
  navigateToCity(cityId: number) {
    this.router.navigate(['/destinations'], { 
      queryParams: { city: cityId } 
    });
  }

  /**
   * Get cities for stats display - accessor method for template
   */
  cities() {
    return this.featuredCities();
  }

  /**
   * Handle search functionality (can be expanded)
   */
  onSearch(searchTerm: string) {
    if (searchTerm.trim()) {
      this.router.navigate(['/destinations'], {
        queryParams: { search: searchTerm.trim() }
      });
    }
  }

  /**
   * Navigate to all destinations
   */
  exploreAllDestinations() {
    this.router.navigate(['/destinations']);
  }

  /**
   * Navigate to all cities
   */
  browseAllCities() {
    this.router.navigate(['/cities']);
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByDestinationId(index: number, destination: Destination): number {
    return destination.id;
  }

  /**
   * Track by function for cities ngFor optimization
   */
  trackByCityId(index: number, city: City): number {
    return city.id;
  }
}