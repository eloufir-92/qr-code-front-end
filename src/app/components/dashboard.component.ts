import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {Restaurant} from '../models/resturaurant.model';
import {ApiService} from '../services/api.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <h1 class="display-4 text-primary">
            <i class="fas fa-qrcode me-3"></i>QR Menu Dashboard
          </h1>
          <a routerLink="/create" class="btn btn-success btn-lg">
            <i class="fas fa-plus me-2"></i>Nouveau Restaurant
          </a>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div *ngIf="!loading && restaurants.length === 0" class="text-center py-5">
        <i class="fas fa-utensils fa-5x text-muted mb-4"></i>
        <h3 class="text-muted">Aucun restaurant</h3>
        <p class="text-muted">Commencez par créer votre premier restaurant.</p>
        <a routerLink="/create" class="btn btn-primary mt-3">
          <i class="fas fa-plus me-2"></i>Créer un restaurant
        </a>
      </div>

      <div *ngIf="!loading && restaurants.length > 0" class="row">
        <div *ngFor="let restaurant of restaurants" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm">
            <img *ngIf="restaurant.logoUrl"
                 [src]="restaurant.logoUrl"
                 [alt]="restaurant.name"
                 class="card-img-top"
                 style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">{{ restaurant.name }}</h5>
              <p class="card-text text-muted">{{ restaurant.description }}</p>
            </div>
            <div class="card-footer bg-transparent">
              <div class="d-flex gap-2">
                <a [routerLink]="['/restaurant', restaurant.id]"
                   class="btn btn-primary flex-fill">
                  <i class="fas fa-cog me-1"></i>Gérer
                </a>
                <a [routerLink]="['/menu', restaurant.id]"
                   class="btn btn-outline-secondary">
                  <i class="fas fa-eye"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  restaurants: Restaurant[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.apiService.getAllRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurants = restaurants;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.loading = false;
      }
    });
  }
}
