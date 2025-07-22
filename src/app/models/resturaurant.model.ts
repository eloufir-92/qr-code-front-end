export interface Restaurant {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  createdAt?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  imageUrl?: string;
  allergies?: string;
  available?: boolean;
  createdAt?: string;
}

export interface QrCode {
  id: number;
  qrCodeData: string;
  tableNumber?: string;
  menuUrl: string;
  createdAt?: string;
}

export interface RestaurantDTO {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface MenuItemDTO {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  imageUrl?: string;
  allergies?: string;
}

export interface QrCodeRequestDTO {
  tableNumber?: string;
}
