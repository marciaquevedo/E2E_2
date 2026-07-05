export type Role = 'PASSENGER' | 'DRIVER';

export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  available: boolean;
  rating: number;
}

export interface Trip {
  id: number;
  status: TripStatus;
  pickupAddress: string;
  dropoffAddress: string;
  requestedAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  passenger: User;
  driver: User | null;
  passengerRating: number | null;
  ratingComment: string | null;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateTripPayload {
  pickupAddress: string;
  dropoffAddress: string;
}

export interface RateTripPayload {
  rating: number;
  comment?: string;
}

export interface AuthResponse {
  token: string;
}

/** Shape of API error bodies: either { error } or field-validation { [field]: message } */
export interface ApiErrorBody {
  error?: string;
  [field: string]: string | undefined;
}
