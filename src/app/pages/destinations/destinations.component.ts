// src/app/pages/destinations/destinations.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Destination, DestinationType } from '../../core/models/destination.model';
import { City } from '../../core/models/city.model';
import { SearchRequest } from '../../core/models/api-response.model';

interface TypeOption {
  label: string;
  value: DestinationType;
}

interface CityOption {
  label: string;
  value: number;
}

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-destinations',
  imports: [
    RouterLink,
    ButtonModule,
    CardModule,
    SkeletonModule,
    InputTextModule,
    DropdownModule,
    PaginatorModule,
    TagModule,
    RatingModule,
    SliderModule,
    MultiSelectModule,
    ToggleButtonModule,
    FormsModule,
    DecimalPipe
  ],
  templateUrl: './destinations.component.html',
  styleUrl: './destinations.component.scss'
})
export default class DestinationsComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Angular 19 signals
  destinations = signal<Destination[]>([]);
  cities = signal<City[]>([]);
  loading = signal(true);
  
  // Filter signals
  searchTerm = signal('');
  selectedCityId = signal<number | null>(null);
  selectedType = signal<DestinationType | null>(null);
  selectedSort = signal('name');
  priceRange = signal([0, 500]);
  minRating = signal(0);
  selectedTags = signal<string[]>([]);
  freeOnly = signal(false);
  showAdvancedFilters = signal(false);
  
  // Pagination signals
  currentPage = signal(0);
  pageSize = signal(12);
  totalDestinations = signal(0);
  
  // Options
  cityOptions = signal<CityOption[]>([]);
  availableTags = signal<string[]>([
    'Historical', 'Nature', 'Cultural', 'Religious', 'Beach', 'Mountain', 
    'Desert', 'Architecture', 'Adventure', 'Peaceful', 'Family-Friendly', 
    'Photography', 'Sunset', 'Marketplace', 'Traditional'
  ]);
  skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  typeOptions: TypeOption[] = [
    { label: 'Historical', value: DestinationType.HISTORICAL },
    { label: 'Natural', value: DestinationType.NATURAL },
    { label: 'Cultural', value: DestinationType.CULTURAL },
    { label: 'Religious', value: DestinationType.RELIGIOUS },
    { label: 'Recreational', value: DestinationType.RECREATIONAL },
    { label: 'Museum', value: DestinationType.MUSEUM },
    { label: 'Market', value: DestinationType.MARKET },
    { label: 'Beach', value: DestinationType.BEACH },
    { label: 'Mountain', value: DestinationType.MOUNTAIN },
    { label: 'Desert', value: DestinationType.DESERT }
  ];
  
  sortOptions: SortOption[] = [
    { label: 'Name A-Z', value: 'name' },
    { label: 'Rating High-Low', value: 'rating' },
    { label: 'Price Low-High', value: 'price' },
    { label: 'Most Reviews', value: 'reviews' },
    { label: 'Recently Added', value: 'date' }
  ];

  // Expose Math for template
  Math = Math;

  // Search timeout for debouncing
  private searchTimeout?: number;

  ngOnInit() {
    this.loadCities();
    this.loadDestinations();
    
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['city']) {
        this.selectedCityId.set(+params['city']);
      }
      if (params['type']) {
        this.selectedType.set(params['type'] as DestinationType);
      }
      if (params['search']) {
        this.searchTerm.set(params['search']);
      }
      if (params['rating']) {
        this.minRating.set(+params['rating']);
      }
      if (params['free'] === 'true') {
        this.freeOnly.set(true);
      }
    });
  }

  loadCities() {
    this.apiService.getAllCities().subscribe({
      next: (cities: City[]) => {
        this.cities.set(cities);
        const options = cities.map(city => ({
          label: city.name,
          value: city.id
        }));
        this.cityOptions.set(options);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
      }
    });
  }

  loadDestinations() {
    this.loading.set(true);
    
    const searchRequest: SearchRequest = {
      keyword: this.searchTerm() || undefined,
      cityId: this.selectedCityId() || undefined,
      type: this.selectedType() || undefined,
      minRating: this.minRating() > 0 ? this.minRating() : undefined,
      maxPrice: this.priceRange()[1] < 500 ? this.priceRange()[1] : undefined,
      tags: this.selectedTags().length > 0 ? this.selectedTags() : undefined,
      freeOnly: this.freeOnly() || undefined,
      sortBy: this.selectedSort(),
      sortDirection: this.getSortDirection(),
      page: this.currentPage(),
      size: this.pageSize()
    };

    // Clean up the request object
    Object.keys(searchRequest).forEach(key => {
      if (searchRequest[key as keyof SearchRequest] === undefined) {
        delete searchRequest[key as keyof SearchRequest];
      }
    });

    this.apiService.searchDestinations(searchRequest).subscribe({
      next: (response) => {
        this.destinations.set(response.content);
        this.totalDestinations.set(response.totalElements);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading destinations:', error);
        this.destinations.set([]);
        this.totalDestinations.set(0);
        this.loading.set(false);
      }
    });
  }

  onSearchChange() {
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Set new timeout for debounced search
    this.searchTimeout = window.setTimeout(() => {
      this.currentPage.set(0);
      this.loadDestinations();
      this.trackFilterUsage('search', this.searchTerm());
    }, 300);
  }

  onFilterChange() {
    this.currentPage.set(0);
    this.loadDestinations();
  }

  onPageChange(event: any) {
    this.currentPage.set(event.page);
    this.pageSize.set(event.rows);
    this.loadDestinations();
  }

  getSortDirection(): 'ASC' | 'DESC' {
    switch (this.selectedSort()) {
      case 'rating':
      case 'reviews':
        return 'DESC';
      case 'name':
      case 'price':
      case 'date':
      default:
        return 'ASC';
    }
  }

  getDestinationImage(destination: Destination): string | null {
    if (destination.mainImage) {
      return destination.mainImage;
    }
    if (destination.images && destination.images.length > 0) {
      return destination.images[0];
    }
    return null;
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severityMap: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      [DestinationType.HISTORICAL]: 'warning',
      [DestinationType.NATURAL]: 'success',
      [DestinationType.CULTURAL]: 'info',
      [DestinationType.RELIGIOUS]: 'secondary',
      [DestinationType.RECREATIONAL]: 'success',
      [DestinationType.MUSEUM]: 'secondary',
      [DestinationType.MARKET]: 'warning',
      [DestinationType.BEACH]: 'info',
      [DestinationType.MOUNTAIN]: 'success',
      [DestinationType.DESERT]: 'warning'
    };
    return severityMap[type] || 'info';
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm() ||
      this.selectedCityId() ||
      this.selectedType() ||
      this.minRating() > 0 ||
      this.priceRange()[1] < 500 ||
      this.selectedTags().length > 0 ||
      this.freeOnly()
    );
  }

  clearAllFilters() {
    this.searchTerm.set('');
    this.selectedCityId.set(null);
    this.selectedType.set(null);
    this.selectedSort.set('name');
    this.priceRange.set([0, 500]);
    this.minRating.set(0);
    this.selectedTags.set([]);
    this.freeOnly.set(false);
    this.currentPage.set(0);
    this.loadDestinations();
  }

  navigateToDestination(id: number) {
    this.router.navigate(['/destinations', id]);
  }

  /**
   * Get readable filter summary for users
   */
  getFilterSummary(): string {
    const filters: string[] = [];
    
    if (this.searchTerm()) {
      filters.push(`"${this.searchTerm()}"`);
    }
    
    if (this.selectedCityId()) {
      const city = this.cities().find(c => c.id === this.selectedCityId());
      if (city) {
        filters.push(`in ${city.name}`);
      }
    }
    
    if (this.selectedType()) {
      filters.push(`${this.selectedType()} destinations`);
    }
    
    if (this.minRating() > 0) {
      filters.push(`${this.minRating()}+ stars`);
    }
    
    if (this.priceRange()[1] < 500) {
      filters.push(`under ${this.priceRange()[1]} MAD`);
    }
    
    if (this.freeOnly()) {
      filters.push('free entry only');
    }
    
    if (this.selectedTags().length > 0) {
      filters.push(`tagged: ${this.selectedTags().join(', ')}`);
    }
    
    return filters.length > 0 ? `Filtered by: ${filters.join(', ')}` : '';
  }

  /**
   * Share current search/filters via URL
   */
  shareCurrentSearch() {
    const params = new URLSearchParams();
    
    if (this.searchTerm()) params.set('search', this.searchTerm());
    if (this.selectedCityId()) params.set('city', this.selectedCityId()!.toString());
    if (this.selectedType()) params.set('type', this.selectedType()!);
    if (this.minRating() > 0) params.set('rating', this.minRating().toString());
    if (this.freeOnly()) params.set('free', 'true');
    
    const url = `${window.location.origin}/destinations?${params.toString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Morocco Destinations Search',
        text: 'Check out these amazing Morocco destinations!',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        console.log('Search URL copied to clipboard');
      });
    }
  }

  /**
   * Save current search as favorite
   */
  saveSearchAsFavorite() {
    const searchData = {
      name: `Search: ${this.searchTerm() || 'All Destinations'}`,
      filters: {
        searchTerm: this.searchTerm(),
        cityId: this.selectedCityId(),
        type: this.selectedType(),
        minRating: this.minRating(),
        priceRange: this.priceRange(),
        tags: this.selectedTags(),
        freeOnly: this.freeOnly()
      },
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('lastSearch', JSON.stringify(searchData));
    console.log('Search saved successfully');
  }

  /**
   * Load last saved search
   */
  loadLastSearch() {
    const saved = localStorage.getItem('lastSearch');
    if (saved) {
      try {
        const searchData = JSON.parse(saved);
        const filters = searchData.filters;
        
        this.searchTerm.set(filters.searchTerm || '');
        this.selectedCityId.set(filters.cityId || null);
        this.selectedType.set(filters.type || null);
        this.minRating.set(filters.minRating || 0);
        this.priceRange.set(filters.priceRange || [0, 500]);
        this.selectedTags.set(filters.tags || []);
        this.freeOnly.set(filters.freeOnly || false);
        
        this.loadDestinations();
        console.log('Last search loaded successfully');
      } catch (error) {
        console.error('Error loading saved search:', error);
      }
    }
  }

  /**
   * Track user interactions for analytics
   */
  trackFilterUsage(filterType: string, filterValue: any) {
    console.log(`Filter used: ${filterType} = ${filterValue}`);
    // Here you would send analytics data to your tracking service
  }

  /**
   * Get performance insights about current search
   */
  getSearchInsights(): string {
    const total = this.totalDestinations();
    const showing = this.destinations().length;
    
    if (total === 0) {
      return 'No results found. Try adjusting your filters.';
    }
    
    if (total <= this.pageSize()) {
      return `Showing all ${total} results.`;
    }
    
    const totalPages = Math.ceil(total / this.pageSize());
    const currentPageNum = this.currentPage() + 1;
    
    return `Page ${currentPageNum} of ${totalPages} • ${total} total results found`;
  }

  /**
   * Export current search results (foundation for future PDF/CSV export)
   */
  exportResults() {
    const exportData = {
      searchCriteria: {
        searchTerm: this.searchTerm(),
        cityId: this.selectedCityId(),
        type: this.selectedType(),
        minRating: this.minRating(),
        priceRange: this.priceRange(),
        tags: this.selectedTags(),
        freeOnly: this.freeOnly(),
        sortBy: this.selectedSort()
      },
      results: this.destinations(),
      totalResults: this.totalDestinations(),
      exportDate: new Date().toISOString()
    };
    
    console.log('Export data prepared:', exportData);
  }

  /**
   * Quick filter presets for common searches
   */
  applyQuickFilter(filterType: string) {
    this.clearAllFilters();
    
    switch (filterType) {
      case 'free':
        this.freeOnly.set(true);
        break;
      case 'highly-rated':
        this.minRating.set(4);
        break;
      case 'historical':
        this.selectedType.set(DestinationType.HISTORICAL);
        break;
      case 'natural':
        this.selectedType.set(DestinationType.NATURAL);
        break;
      case 'budget':
        this.priceRange.set([0, 100]);
        break;
    }
    
    this.loadDestinations();
  }

  /**
   * Scroll to top of page
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}