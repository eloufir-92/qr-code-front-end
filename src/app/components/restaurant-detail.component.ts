import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {MenuItem, MenuItemDTO, QrCode, Restaurant} from '../models/resturaurant.model';
import {ApiService} from '../services/api.service';


@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <div *ngIf="!loading && restaurant">
        <!-- Header -->
        <div class="mb-4">
          <button class="btn btn-outline-secondary mb-3" (click)="goBack()">
            <i class="fas fa-arrow-left me-2"></i>Retour au dashboard
          </button>

          <div class="row align-items-center">
            <div class="col-md-6">
              <div class="d-flex align-items-center">
                <img *ngIf="restaurant.logoUrl"
                     [src]="restaurant.logoUrl"
                     [alt]="restaurant.name"
                     class="rounded me-3"
                     style="width: 80px; height: 80px; object-fit: cover;">
                <div>
                  <h1 class="mb-1">{{ restaurant.name }}</h1>
                  <p class="text-muted mb-0">{{ restaurant.description }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 text-md-end">
              <button class="btn btn-success me-2" (click)="showAddItem = true">
                <i class="fas fa-plus me-2"></i>Ajouter un plat
              </button>
              <button class="btn btn-primary" (click)="showQrGenerator = true">
                <i class="fas fa-qrcode me-2"></i>Générer QR Code
              </button>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Menu Items -->
          <div class="col-lg-8">
            <h2 class="mb-4">Menu</h2>

            <!-- Add Item Form -->
            <div *ngIf="showAddItem" class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Ajouter un plat</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="addMenuItem()" #itemForm="ngForm">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Nom du plat"
                        [(ngModel)]="newItem.name"
                        name="name"
                        required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <input
                        type="number"
                        step="0.01"
                        class="form-control"
                        placeholder="Prix (€)"
                        [(ngModel)]="newItem.price"
                        name="price"
                        required>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Catégorie"
                        [(ngModel)]="newItem.category"
                        name="category">
                    </div>
                    <div class="col-md-6 mb-3">
                      <input
                        type="url"
                        class="form-control"
                        placeholder="URL de l'image"
                        [(ngModel)]="newItem.imageUrl"
                        name="imageUrl">
                    </div>
                  </div>
                  <div class="mb-3">
                    <textarea
                      class="form-control"
                      placeholder="Description"
                      rows="2"
                      [(ngModel)]="newItem.description"
                      name="description"></textarea>
                  </div>
                  <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-secondary" (click)="cancelAddItem()">
                      Annuler
                    </button>
                    <button type="submit" class="btn btn-success" [disabled]="!itemForm.form.valid">
                      Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Menu Items List -->
            <div *ngIf="menuItems.length === 0" class="text-center py-5">
              <p class="text-muted">Aucun plat dans le menu</p>
            </div>

            <div *ngFor="let item of menuItems" class="card mb-3">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-2" *ngIf="item.imageUrl">
                    <img [src]="item.imageUrl"
                         [alt]="item.name"
                         class="img-fluid rounded"
                         style="height: 80px; object-fit: cover;">
                  </div>
                  <div class="col">
                    <h5 class="mb-1">{{ item.name }}</h5>
                    <p class="text-muted mb-1">{{ item.description }}</p>
                    <div class="d-flex align-items-center">
                      <span class="h5 text-success me-3">{{ item.price }}€</span>
                      <span *ngIf="item.category" class="badge bg-secondary">{{ item.category }}</span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <button class="btn btn-outline-danger btn-sm" (click)="deleteMenuItem(item.id!)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- QR Codes -->
          <div class="col-lg-4">
            <h2 class="mb-4">QR Codes</h2>

            <!-- QR Generator Form -->
            <div *ngIf="showQrGenerator" class="card mb-4">
              <div class="card-header">
                <h6 class="mb-0">Générer un QR Code</h6>
              </div>
              <div class="card-body">
                <form (ngSubmit)="generateQrCode()">
                  <div class="mb-3">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Numéro de table (optionnel)"
                      [(ngModel)]="qrRequest.tableNumber"
                      name="tableNumber">
                  </div>
                  <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-secondary btn-sm" (click)="showQrGenerator = false">
                      Annuler
                    </button>
                    <button type="submit" class="btn btn-primary btn-sm">
                      Générer
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- QR Codes List -->
            <div *ngFor="let qr of qrCodes" class="card mb-3">
              <div class="card-body text-center">
                <img [src]="qr.qrCodeData"
                     alt="QR Code"
                     class="img-fluid mb-2"
                     style="max-width: 150px;">
                <p *ngIf="qr.tableNumber" class="fw-bold mb-1">Table {{ qr.tableNumber }}</p>
                <p class="text-muted small">{{ qr.menuUrl }}</p>
                <button class="btn btn-outline-primary btn-sm" (click)="downloadQrCode(qr)">
                  <i class="fas fa-download me-1"></i>Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RestaurantDetailComponent implements OnInit {
  restaurant: Restaurant | null = null;
  menuItems: MenuItem[] = [];
  qrCodes: QrCode[] = [];
  loading = true;
  showAddItem = false;
  showQrGenerator = false;

  newItem: MenuItemDTO = {
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: ''
  };

  qrRequest = {
    tableNumber: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRestaurantData(id);
  }

  loadRestaurantData(id: number): void {
    Promise.all([
      this.apiService.getRestaurant(id).toPromise(),
      this.apiService.getMenu(id).toPromise(),
      this.apiService.getQrCodes(id).toPromise()
    ]).then(([restaurant, menuItems, qrCodes]) => {
      this.restaurant = restaurant!;
      this.menuItems = menuItems!;
      this.qrCodes = qrCodes!;
      this.loading = false;
    }).catch(error => {
      console.error('Erreur lors du chargement:', error);
      this.loading = false;
    });
  }

  addMenuItem(): void {
    if (!this.restaurant) return;

    this.apiService.addMenuItem(this.restaurant.id, this.newItem).subscribe({
      next: () => {
        this.loadRestaurantData(this.restaurant!.id);
        this.cancelAddItem();
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'ajout:', error);
      }
    });
  }

  cancelAddItem(): void {
    this.showAddItem = false;
    this.newItem = {
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: ''
    };
  }

  generateQrCode(): void {
    if (!this.restaurant) return;

    this.apiService.generateQrCode(this.restaurant.id, this.qrRequest).subscribe({
      next: () => {
        this.loadRestaurantData(this.restaurant!.id);
        this.showQrGenerator = false;
        this.qrRequest = { tableNumber: '' };
      },
      error: (error: any) => {
        console.error('Erreur lors de la génération:', error);
      }
    });
  }

  deleteMenuItem(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      this.apiService.deleteMenuItem(id).subscribe({
        next: () => {
          this.loadRestaurantData(this.restaurant!.id);
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  downloadQrCode(qr: QrCode): void {
    const link = document.createElement('a');
    link.download = `qr-code-${qr.tableNumber || 'menu'}.png`;
    link.href = qr.qrCodeData;
    link.click();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
