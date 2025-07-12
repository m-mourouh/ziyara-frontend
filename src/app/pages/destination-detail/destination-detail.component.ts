// src/app/pages/destination-detail/destination-detail.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { GalleriaModule } from 'primeng/galleria';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { Destination } from '../../core/models/destination.model';

interface GalleryImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
  title: string;
}

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

@Component({
  selector: 'app-destination-detail',
  imports: [
    RouterLink,
    ButtonModule,
    CardModule,
    TagModule,
    RatingModule,
    GalleriaModule,
    SkeletonModule,
    TooltipModule,
    FormsModule
  ],
  template: `
    <!-- Loading State -->
    @if (loading()) {
      <div class="min-h-screen bg-gray-50">
        <!-- Header Skeleton -->
        <div class="bg-white shadow-sm">
          <div class="container mx-auto px-4 py-6">
            <div class="flex items-center gap-4">
              <p-skeleton width="120px" height="40px"></p-skeleton>
              <div class="flex-1">
                <p-skeleton width="300px" height="32px" class="mb-2"></p-skeleton>
                <p-skeleton width="200px" height="20px"></p-skeleton>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Skeleton -->
        <div class="container mx-auto px-4 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
              <p-skeleton width="100%" height="400px"></p-skeleton>
              <div class="space-y-4">
                <p-skeleton width="100%" height="20px"></p-skeleton>
                <p-skeleton width="80%" height="20px"></p-skeleton>
                <p-skeleton width="90%" height="20px"></p-skeleton>
              </div>
            </div>
            
            <!-- Sidebar -->
            <div class="space-y-6">
              <p-skeleton width="100%" height="200px"></p-skeleton>
              <p-skeleton width="100%" height="150px"></p-skeleton>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Main Content -->
    @if (!loading() && destination()) {
      <!-- Navigation Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <p-button 
                icon="pi pi-arrow-left"
                severity="secondary"
                [text]="true"
                (onClick)="goBack()"
                pTooltip="Go back">
              </p-button>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ destination()?.name }}</h1>
                <div class="flex items-center gap-2 mt-1">
                  <i class="pi pi-map-marker text-primary-500"></i>
                  <span class="text-gray-600">{{ destination()?.cityName }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <p-button 
                [icon]="isFavorite() ? 'pi pi-heart-fill' : 'pi pi-heart'"
                [severity]="isFavorite() ? 'danger' : 'secondary'"
                [text]="true"
                (onClick)="toggleFavorite()"
                [pTooltip]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'">
              </p-button>
              <p-button 
                icon="pi pi-share-alt"
                severity="secondary"
                [text]="true"
                (onClick)="shareDestination()"
                pTooltip="Share destination">
              </p-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left Column - Main Content -->
            <div class="lg:col-span-2 space-y-8">
              
              <!-- Image Gallery -->
              <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                @if (galleryImages().length > 0) {
                  <p-galleria 
                    [value]="galleryImages()" 
                    [responsiveOptions]="responsiveOptions"
                    [numVisible]="5"
                    [circular]="true"
                    [autoPlay]="true"
                    [transitionInterval]="3000"
                    [showThumbnails]="true"
                    [showIndicators]="false"
                    [changeItemOnIndicatorHover]="true"
                    [containerStyle]="{ width: '100%', height: '500px' }">
                    
                    <ng-template pTemplate="item" let-item>
                      <img 
                        [src]="item.itemImageSrc" 
                        [alt]="item.alt"
                        class="w-full h-full object-cover" />
                    </ng-template>
                    
                    <ng-template pTemplate="thumbnail" let-item>
                      <img 
                        [src]="item.thumbnailImageSrc" 
                        [alt]="item.alt"
                        class="w-full h-full object-cover" />
                    </ng-template>
                  </p-galleria>
                } @else {
                  <div class="h-96 bg-gray-200 flex items-center justify-center">
                    <div class="text-center">
                      <i class="pi pi-image text-4xl text-gray-400 mb-4"></i>
                      <p class="text-gray-500">No images available</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Destination Info -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex items-start justify-between mb-6">
                  <div class="flex-1">
                    <div class="flex items-center gap-4 mb-4">
                      <p-tag 
                        [value]="destination()?.type || ''"
                        [severity]="getTypeSeverity(destination()?.type || '')"
                        [rounded]="true">
                      </p-tag>
                      @if (destination()?.averageRating) {
                        <div class="flex items-center gap-2">
                          <p-rating 

                            [readonly]="true" 
                            [stars]="5">
                          </p-rating>
                          <span class="text-sm text-gray-600">
                            {{ destination()?.averageRating }}/5 ({{ destination()?.reviewCount }} reviews)
                          </span>
                        </div>
                      }
                    </div>
                    
                    <div class="flex items-center gap-4 mb-4">
                      @if (destination()?.entryFee && (destination()?.entryFee ?? 0) > 0) {
                        <div class="flex items-center gap-2">
                          <i class="pi pi-money-bill text-green-500"></i>
                          <span class="text-lg font-semibold text-green-600">
                            {{ destination()?.entryFee }} MAD
                          </span>
                        </div>
                      } @else {
                        <div class="flex items-center gap-2">
                          <i class="pi pi-check-circle text-green-500"></i>
                          <span class="text-lg font-semibold text-green-600">Free Entry</span>
                        </div>
                      }
                      
                      @if (destination()?.openingHours) {
                        <div class="flex items-center gap-2">
                          <i class="pi pi-clock text-blue-500"></i>
                          <span class="text-gray-600">{{ destination()?.openingHours }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div class="prose max-w-none">
                  <h3 class="text-xl font-semibold mb-4">About This Destination</h3>
                  <p class="text-gray-700 leading-relaxed">
                    {{ destination()?.description }}
                  </p>
                </div>

                <!-- Tags -->
                @if (destination()?.tags && (destination()?.tags?.length ?? 0) > 0) {
                  <div class="mt-6">
                    <h4 class="font-semibold mb-3">Tags</h4>
                    <div class="flex flex-wrap gap-2">
                      @for (tag of destination()?.tags; track tag) {
                        <p-tag 
                          [value]="tag"
                          severity="info"
                          [rounded]="true">
                        </p-tag>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Reviews Section -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-semibold">Reviews</h3>
                  <p-button 
                    label="Write a Review"
                    icon="pi pi-star"
                    severity="info"
                    [outlined]="true"
                    (onClick)="openReviewDialog()">
                  </p-button>
                </div>

                @if (sampleReviews.length > 0) {
                  <div class="space-y-6">
                    @for (review of sampleReviews; track review.id) {
                      <div class="border-b border-gray-200 pb-6 last:border-b-0">
                        <div class="flex items-start gap-4">
                          <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <span class="text-primary-600 font-semibold">
                              {{ review.author.charAt(0) }}
                            </span>
                          </div>
                          <div class="flex-1">
                            <div class="flex items-center gap-4 mb-2">
                              <h4 class="font-semibold">{{ review.author }}</h4>
                              <p-rating 
                                [ngModel]="review.rating" 
                                [readonly]="true" 
                                styleClass="text-sm">
                              </p-rating>
                              <span class="text-sm text-gray-500">{{ review.date }}</span>
                            </div>
                            <p class="text-gray-700">{{ review.comment }}</p>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-8">
                    <i class="pi pi-star text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                }
              </div>
            </div>

            <!-- Right Column - Sidebar -->
            <div class="space-y-6">
              
              <!-- Quick Actions -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
                <div class="space-y-3">
                  <p-button 
                    label="Get Directions"
                    icon="pi pi-directions"
                    styleClass="w-full"
                    severity="info"
                    (onClick)="getDirections()">
                  </p-button>
                  <p-button 
                    label="Book Now"
                    icon="pi pi-calendar"
                    styleClass="w-full"
                    severity="success"
                    (onClick)="bookNow()">
                  </p-button>
                  <p-button 
                    label="Contact Info"
                    icon="pi pi-phone"
                    styleClass="w-full"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="showContactInfo()">
                  </p-button>
                </div>
              </div>

              <!-- Location Info -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold mb-4">Location</h3>
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <i class="pi pi-map-marker text-primary-500"></i>
                    <div>
                      <p class="font-medium">{{ destination()?.cityName }}</p>
                      <p class="text-sm text-gray-600">Morocco</p>
                    </div>
                  </div>
                  @if (destination()?.latitude && destination()?.longitude) {
                    <div class="flex items-center gap-3">
                      <i class="pi pi-compass text-primary-500"></i>
                      <div>
                        <p class="text-sm text-gray-600">Coordinates</p>
                        <p class="font-mono text-sm">
                          {{ destination()?.latitude }}, {{ destination()?.longitude }}
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Nearby Destinations -->
              <div class="bg-white rounded-lg shadow-sm p-6">
                <h3 class="text-lg font-semibold mb-4">Nearby Destinations</h3>
                @if (relatedDestinations().length > 0) {
                  <div class="space-y-4">
                    @for (related of relatedDestinations(); track related.id) {
                      <div class="flex gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                           (click)="navigateToDestination(related.id)">
                        <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          @if (related.mainImage) {
                            <img 
                              [src]="related.mainImage" 
                              [alt]="related.name"
                              class="w-full h-full object-cover rounded-lg">
                          } @else {
                            <i class="pi pi-image text-gray-400"></i>
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="font-medium truncate">{{ related.name }}</h4>
                          <p class="text-sm text-gray-600 truncate">{{ related.cityName }}</p>
                          <div class="flex items-center gap-2 mt-1">
                            <p-rating 
                              [(ngModel)]="related.averageRating" 
                              [readonly]="true" 
                              [stars]="5"
                              styleClass="text-xs">
                            </p-rating>
                            <span class="text-xs text-gray-500">({{ related.reviewCount }})</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-gray-500 text-sm">No nearby destinations found.</p>
                }
              </div>
              
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Error State -->
    @if (!loading() && !destination()) {
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="pi pi-exclamation-triangle text-3xl text-gray-400"></i>
          </div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-2">Destination Not Found</h2>
          <p class="text-gray-600 mb-6">The destination you're looking for doesn't exist or has been removed.</p>
          <p-button 
            label="Back to Destinations" 
            icon="pi pi-arrow-left"
            styleClass="btn-primary"
            routerLink="/destinations">
          </p-button>
        </div>
      </div>
    }
  `,
  styleUrl: './destination-detail.component.scss'
})
export default class DestinationDetailComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private messageService = inject(MessageService);

  // Angular 19 signals
  destination = signal<Destination | null>(null);
  relatedDestinations = signal<Destination[]>([]);
  loading = signal(true);
  isFavorite = signal(false);
  galleryImages = signal<GalleryImage[]>([]);

  // Gallery configuration
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  // Sample data
  sampleReviews: Review[] = [
    {
      id: 1,
      author: 'Ahmed Hassan',
      rating: 5,
      date: 'March 2024',
      comment: 'Absolutely stunning! The architecture is breathtaking and the history is fascinating. A must-visit when in Morocco.'
    },
    {
      id: 2,
      author: 'Sarah Johnson',
      rating: 4,
      date: 'February 2024',
      comment: 'Beautiful destination with rich history. Can get quite crowded during peak hours, but definitely worth the visit.'
    },
    {
      id: 3,
      author: 'Mohamed Alami',
      rating: 5,
      date: 'January 2024',
      comment: 'One of the most impressive places I\'ve ever visited. The guide was very knowledgeable and the views are incredible.'
    }
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadDestination(+id);
      }
    });
  }

  loadDestination(id: number) {
    this.loading.set(true);
    
    this.apiService.getDestinationById(id).subscribe({
      next: (destination) => {
        this.destination.set(destination);
        this.setupGallery(destination);
        this.loadRelatedDestinations(destination.cityId);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading destination:', error);
        this.destination.set(null);
        this.loading.set(false);
      }
    });
  }

  setupGallery(destination: Destination) {
    const images: GalleryImage[] = [];
    
    // Add main image
    if (destination.mainImage) {
      images.push({
        itemImageSrc: destination.mainImage,
        thumbnailImageSrc: destination.mainImage,
        alt: destination.name,
        title: destination.name
      });
    }

    // Add additional images if available
    if (destination.images && destination.images.length > 0) {
      destination.images.forEach((image, index) => {
        images.push({
          itemImageSrc: image,
          thumbnailImageSrc: image,
          alt: `${destination.name} - Image ${index + 1}`,
          title: `${destination.name} - Image ${index + 1}`
        });
      });
    }

    this.galleryImages.set(images);
  }

  loadRelatedDestinations(cityId: number) {
    this.apiService.getDestinationsByCity(cityId).subscribe({
      next: (destinations) => {
        // Filter out current destination and limit to 3
        const related = destinations
          .filter(d => d.id !== this.destination()?.id)
          .slice(0, 3);
        this.relatedDestinations.set(related);
      },
      error: (error) => {
        console.error('Error loading related destinations:', error);
        this.relatedDestinations.set([]);
      }
    });
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (type) {
      case 'HISTORICAL': return 'info';
      case 'NATURAL': return 'success';
      case 'CULTURAL': return 'warning';
      case 'RELIGIOUS': return 'danger';
      default: return 'info';
    }
  }

  goBack() {
    this.location.back();
  }

  toggleFavorite() {
    this.isFavorite.update(current => !current);
    // Here you would typically call your API to update favorites
    const action = this.isFavorite() ? 'added to' : 'removed from';
    this.messageService.add({
      severity: 'success',
      summary: 'Favorites Updated',
      detail: `Destination ${action} favorites`
    });
  }

  shareDestination() {
    if (navigator.share) {
      navigator.share({
        title: this.destination()?.name,
        text: this.destination()?.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      this.messageService.add({
        severity: 'success',
        summary: 'Link Copied',
        detail: 'Destination link copied to clipboard'
      });
    }
  }

  getDirections() {
    const dest = this.destination();
    if (dest?.latitude && dest?.longitude) {
      const url = `https://maps.google.com/maps?daddr=${dest.latitude},${dest.longitude}`;
      window.open(url, '_blank');
    }
  }

  bookNow() {
    // Navigate to booking page or show booking modal
    this.messageService.add({
      severity: 'info',
      summary: 'Booking',
      detail: 'Booking feature coming soon!'
    });
  }

  showContactInfo() {
    // Show contact information modal
    this.messageService.add({
      severity: 'info',
      summary: 'Contact Information',
      detail: 'Contact details will be displayed here'
    });
  }

  openReviewDialog() {
    // Open review dialog
    this.messageService.add({
      severity: 'info',
      summary: 'Review',
      detail: 'Review form coming soon!'
    });
  }

  navigateToDestination(id: number) {
    this.router.navigate(['/destinations', id]);
  }
}