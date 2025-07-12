import { Destination } from "./destination.model";

export interface SystemStats {
    totalCities: number;
    totalDestinations: number;
    totalReviews: number;
    averageRating: number;
    popularDestinations: Destination[];
    recentlyAdded: Destination[];
  }