import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {MenuItem, Restaurant} from '../models/resturaurant.model';
import {ApiService} from '../services/api.service';


@Component({
  selector: 'app-menu-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Loading -->
    <div *ngIf="loading" class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <!-- Menu Content -->
    <div *ngIf="!loading" class="min-vh-100 bg-light">
      <!-- Header -->
      <div class="bg-white shadow-sm">
        <div class="container py-4 text-center">
          <div class="d-flex align-items-center justify-content-center">
            <img *ngIf="restaurant?.logoUrl"
                 [src]="restaurant?.logoUrl"
                 [alt]="restaurant?.name"
                 class="rounded-circle me-3"
                 style="width: 80px; height: 80px; object-fit: cover;">
            <div>
              <h1 class="display-5 mb-1">{{ restaurant?.name }}</h1>
              <p *ngIf="restaurant?.description" class="text-muted mb-2">{{ restaurant?.description }}</p>
              <span *ngIf="tableNumber" class="badge bg-primary fs-6">
                Table {{ tableNumber }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu -->
      <div class="container py-4">
        <div *ngIf="Object.keys(groupedItems).length === 0" class="text-center py-5">
          <i class="fas fa-utensils fa-4x text-muted mb-3"></i>
          <h3 class="text-muted">Menu en cours de préparation...</h3>
        </div>

        <div *ngFor="let category of Object.keys(groupedItems)" class="mb-5">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h2 class="h4 mb-0">
                <i class="fas fa-utensils me-2"></i>{{ category }}
              </h2>
            </div>
            <div class="card-body p-0">
              <div *ngFor="let item of groupedItems[category]; let last = last"
                   class="p-4"
                   [class.border-bottom]="!last">
                <div class="row align-items-start">
                  <div class="col-md-3" *ngIf="item.imageUrl">
                    <img [src]="item.imageUrl"
                         [alt]="item.name"
                         class="img-fluid rounded shadow-sm"
                         style="height: 120px; width: 100%; object-fit: cover;">
                  </div>
                  <div class="col">
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="flex-grow-1">
                        <h3 class="h5 mb-2 text-dark">{{ item.name }}</h3>
                        <p *ngIf="item.description" class="text-muted mb-2">{{ item.description }}</p>
                      </div>
                      <div class="text-end ms-3">
                        <span class="h4 text-success fw-bold">{{ item.price }}€</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-white border-top mt-5">
        <div class="container py-4 text-center">
          <p class="text-muted mb-0">
            <i class="fas fa-qrcode me-2"></i>
            Powered by QR Menu - Solution digitale pour restaurants
          </p>
        </div>
      </div>
    </div>
  `
})
export class MenuViewComponent implements OnInit {
  restaurant: Restaurant | null = null;
  menuItems: MenuItem[] = [];
  tableNumber: string | null = null;
  loading = true;
  groupedItems: { [key: string]: MenuItem[] } = {};

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tableNumber = this.route.snapshot.queryParamMap.get('table');
    this.loadMenuData(id);
  }

  loadMenuData(id: number): void {
    Promise.all([
      this.apiService.getRestaurant(id).toPromise(),
      this.apiService.getMenu(id).toPromise()
    ]).then(([restaurant, menuItems]) => {
      this.restaurant = restaurant!;
      this.menuItems = menuItems!;
      this.groupMenuItems();
      this.loading = false;
    }).catch(error => {
      console.error('Erreur lors du chargement du menu:', error);
      this.loading = false;
    });
  }

  groupMenuItems(): void {
    this.groupedItems = this.menuItems.reduce((groups, item) => {
      const category = item.category || 'Autres';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as { [key: string]: MenuItem[] });
  }

  // Méthode utilitaire pour TypeScript
  Object = Object;
}
