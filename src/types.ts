export type UserRole = 'farmer' | 'customer' | 'dealer';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  location?: LocationCoordinates;
  soilType?: string;
  landPapersProof?: string; // File name or "Uploaded"
  dealerDocsProof?: string; // File name or "Uploaded"
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon?: string;
  humidity: number;
  windSpeed: number;
  locationName: string;
  forecastDate: string;
  alert?: {
    severity: 'info' | 'warning' | 'danger';
    message: string;
  };
}

export interface CropSuggestion {
  cropName: string;
  expectedHarvestMonths: number;
  currentMarketPrice: number;
  predictedHarvestPrice: number;
  yieldEstimation: string; // e.g. "2.5 tons per acre"
  climateReasoning: string;
  soilReasoning: string;
  confidenceScore: number; // e.g. 95
  schedule: {
    week: number;
    title: string;
    instructions: string;
  }[];
}

export interface CropDiseaseResult {
  diseaseName: string;
  confidence: number;
  symptoms: string[];
  recommendedPesticides: {
    name: string;
    estimatedPriceRange: string;
    applicationInstructions: string;
  }[];
}

export interface MarketItem {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  cropName: string;
  quantity: number; // in kg
  price: number; // set by farmer (default or fallback)
  priceForCustomer: number; // custom price for retail customers
  priceForDealer: number; // custom price for bulk dealers
  liveMarketPrice: number; // benchmark
  location: LocationCoordinates;
  createdAt: string;
  description?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CropPredictionInput {
  lat: number;
  lng: number;
  soilType: string;
  customSoil?: boolean;
}
