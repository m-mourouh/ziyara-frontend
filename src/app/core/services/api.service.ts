// src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  City, 
  Destination, 
  DestinationType,
  ApiResponse, 
  PagedResponse, 
  SearchRequest,
  Review,
  CreateReviewRequest,
  ImageUploadResponse,
  SystemStats,
  ApiError
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl =  'http://localhost:8080/api';

  // ========== CITY ENDPOINTS ==========

  /**
   * Get all cities
   */
  getAllCities(): Observable<City[]> {
    return this.http.get<any>(`${this.baseUrl}/cities`)
      .pipe(
        map(response => {
          console.log('API Service - Raw response:', response);
          
          // Handle the exact API response structure: {success: true, data: {content: []}}
          if (response && response.success && response.data && response.data.content && Array.isArray(response.data.content)) {
            console.log('API Service - Successfully extracted cities from response.data.content');
            return response.data.content as City[];
          }
          // Fallback for other possible structures
          else if (response && response.content && Array.isArray(response.content)) {
            console.log('API Service - Fallback: extracted from response.content');
            return response.content as City[];
          } 
          else if (Array.isArray(response)) {
            console.log('API Service - Fallback: response is direct array');
            return response as City[];
          }
          else {
            console.warn('API Service - Unexpected response structure:', response);
            return [];
          }
        }),
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Get city by ID
   */
  getCityById(id: number): Observable<City> {
    return this.http.get<ApiResponse<City>>(`${this.baseUrl}/cities/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get cities with pagination
   */
  getCitiesPaged(page: number = 0, size: number = 10): Observable<PagedResponse<City>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedResponse<City>>(`${this.baseUrl}/cities/paged`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // ========== DESTINATION ENDPOINTS ==========

  /**
   * Get all destinations
   */
  getAllDestinations(): Observable<Destination[]> {
    return this.http.get<ApiResponse<Destination[]>>(`${this.baseUrl}/destinations`)
      .pipe(
        map(response => response.data),
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Get destination by ID
   */
  getDestinationById(id: number): Observable<Destination> {
    return this.http.get<ApiResponse<Destination>>(`${this.baseUrl}/destinations/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get destinations by city
   */
  getDestinationsByCity(cityId: number): Observable<Destination[]> {
    return this.http.get<ApiResponse<Destination[]>>(`${this.baseUrl}/destinations/city/${cityId}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get destinations by type
   */
  getDestinationsByType(type: DestinationType): Observable<Destination[]> {
    return this.http.get<ApiResponse<Destination[]>>(`${this.baseUrl}/destinations/type/${type}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get popular destinations
   */
  getPopularDestinations(limit: number = 6): Observable<Destination[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<ApiResponse<Destination[]>>(`${this.baseUrl}/destinations/popular`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get recently added destinations
   */
  getRecentDestinations(limit: number = 6): Observable<Destination[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<ApiResponse<Destination[]>>(`${this.baseUrl}/destinations/recent`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ========== SEARCH ENDPOINTS ==========

  /**
   * Search destinations with filters
   */
  searchDestinations(searchRequest: SearchRequest): Observable<PagedResponse<Destination>> {
    let params = new HttpParams();

    // Add search parameters
    if (searchRequest.keyword) {
      params = params.set('keyword', searchRequest.keyword);
    }
    if (searchRequest.cityId) {
      params = params.set('cityId', searchRequest.cityId.toString());
    }
    if (searchRequest.type) {
      params = params.set('type', searchRequest.type);
    }
    if (searchRequest.minRating) {
      params = params.set('minRating', searchRequest.minRating.toString());
    }
    if (searchRequest.maxPrice) {
      params = params.set('maxPrice', searchRequest.maxPrice.toString());
    }
    if (searchRequest.freeOnly) {
      params = params.set('freeOnly', searchRequest.freeOnly.toString());
    }
    if (searchRequest.sortBy) {
      params = params.set('sortBy', searchRequest.sortBy);
    }
    if (searchRequest.sortDirection) {
      params = params.set('sortDirection', searchRequest.sortDirection);
    }
    if (searchRequest.tags && searchRequest.tags.length > 0) {
      params = params.set('tags', searchRequest.tags.join(','));
    }

    // Pagination
    params = params.set('page', (searchRequest.page || 0).toString());
    params = params.set('size', (searchRequest.size || 12).toString());

    return this.http.get<PagedResponse<Destination>>(`${this.baseUrl}/destinations/search`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Search destinations by location (nearby)
   */
  searchNearbyDestinations(latitude: number, longitude: number, radius: number = 50): Observable<Destination[]> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radius', radius.toString());

    return this.http.get<ApiResponse<Destination[]>>(`${this.baseUrl}/destinations/nearby`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ========== REVIEW ENDPOINTS ==========

  /**
   * Get reviews for a destination
   */
  getDestinationReviews(destinationId: number, page: number = 0, size: number = 10): Observable<PagedResponse<Review>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PagedResponse<Review>>(`${this.baseUrl}/destinations/${destinationId}/reviews`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Create a new review
   */
  createReview(review: CreateReviewRequest): Observable<Review> {
    return this.http.post<ApiResponse<Review>>(`${this.baseUrl}/reviews`, review)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ========== IMAGE ENDPOINTS ==========

  /**
   * Upload image for destination
   */
  uploadDestinationImage(destinationId: number, file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<ImageUploadResponse>>(`${this.baseUrl}/destinations/${destinationId}/images`, formData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Delete destination image
   */
  deleteDestinationImage(destinationId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/destinations/${destinationId}/images/${imageId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ========== STATISTICS ENDPOINTS ==========

  /**
   * Get system statistics
   */
  getSystemStats(): Observable<SystemStats> {
    return this.http.get<ApiResponse<SystemStats>>(`${this.baseUrl}/stats`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ========== UTILITY METHODS ==========

  /**
   * Get all available destination types
   */
  getDestinationTypes(): DestinationType[] {
    return Object.values(DestinationType);
  }

  /**
   * Get all available tags
   */
  getAvailableTags(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/destinations/tags`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Check if destination is favorite (placeholder for future auth)
   */
  isFavorite(destinationId: number): Observable<boolean> {
    // This would check user's favorites when authentication is implemented
    return this.http.get<ApiResponse<boolean>>(`${this.baseUrl}/favorites/${destinationId}`)
      .pipe(
        map(response => response.data),
        catchError(() => {
          // Return false if not authenticated or error
          return [false];
        })
      );
  }

  /**
   * Toggle favorite status (placeholder for future auth)
   */
  toggleFavorite(destinationId: number): Observable<boolean> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/favorites/${destinationId}`, {})
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // ========== ERROR HANDLING ==========

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      apiError = {
        message: 'A network error occurred. Please check your internet connection.',
        status: 0,
        timestamp: new Date().toISOString(),
        path: error.url || '',
        error: error.error.message
      };
    } else {
      // Server-side error
      if (error.error && typeof error.error === 'object') {
        apiError = {
          message: error.error.message || 'An unexpected error occurred',
          status: error.status,
          timestamp: error.error.timestamp || new Date().toISOString(),
          path: error.error.path || error.url || '',
          error: error.error.error,
          details: error.error.details
        };
      } else {
        apiError = {
          message: this.getErrorMessage(error.status),
          status: error.status,
          timestamp: new Date().toISOString(),
          path: error.url || '',
          error: error.statusText
        };
      }
    }

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  };

  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'You are not authorized to access this resource.';
      case 403:
        return 'Access to this resource is forbidden.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      case 503:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}