import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {MenuItem, MenuItemDTO, QrCode, QrCodeRequestDTO, Restaurant, RestaurantDTO} from '../models/resturaurant.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Restaurants
  createRestaurant(restaurant: RestaurantDTO): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.apiUrl}/restaurants`, restaurant);
  }

  getAllRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/restaurants`);
  }

  getRestaurant(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/restaurants/${id}`);
  }

  // Menu Items
  addMenuItem(restaurantId: number, menuItem: MenuItemDTO): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.apiUrl}/restaurants/${restaurantId}/menu`, menuItem);
  }

  getMenu(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/restaurants/${restaurantId}/menu`);
  }

  deleteMenuItem(menuItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/menu/${menuItemId}`);
  }

  // QR Codes
  generateQrCode(restaurantId: number, request: QrCodeRequestDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/restaurants/${restaurantId}/qr-code`, request);
  }

  getQrCodes(restaurantId: number): Observable<QrCode[]> {
    return this.http.get<QrCode[]>(`${this.apiUrl}/restaurants/${restaurantId}/qr-codes`);
  }

  // Health
  healthCheck(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
  }
}
