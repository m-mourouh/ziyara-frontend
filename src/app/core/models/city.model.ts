// src/app/core/models/city.model.ts
export interface City {
  id: number;
  name: string;
  arabicName?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  image?: string;
  imageUrl?: string; // API field name
  destinationCount: number;
  averageRating?: number;
  reviewCount?: number;
  isPopular?: boolean;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
  displayName?: string; // API field
  coordinates?: string; // API field
}