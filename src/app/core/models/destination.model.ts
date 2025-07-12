export interface Destination {
    id: number;
    name: string;
    description: string;
    type: DestinationType;
    cityId: number;
    cityName: string;
    latitude?: number;
    longitude?: number;
    entryFee?: number;
    openingHours?: string;
    mainImage?: string;
    images?: string[];
    averageRating?: number;
    reviewCount: number;
    tags?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export enum DestinationType {
    HISTORICAL = 'HISTORICAL',
    NATURAL = 'NATURAL', 
    CULTURAL = 'CULTURAL',
    RELIGIOUS = 'RELIGIOUS',
    RECREATIONAL = 'RECREATIONAL',
    MUSEUM = 'MUSEUM',
    MARKET = 'MARKET',
    BEACH = 'BEACH',
    MOUNTAIN = 'MOUNTAIN',
    DESERT = 'DESERT'
  }
  