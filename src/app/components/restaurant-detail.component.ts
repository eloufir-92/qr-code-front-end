import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as QRCode from 'qrcode';
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
                    <div class="col-md-4 mb-3">
                      <input
                        type="number"
                        step="0.01"
                        class="form-control"
                        placeholder="Prix"
                        [(ngModel)]="newItem.price"
                        name="price"
                        required>
                    </div>
                    <div class="col-md-2 mb-3">
                      <select
                        class="form-select"
                        [(ngModel)]="newItem.currency"
                        name="currency">
                        <option value="EUR">€ EUR</option>
                        <option value="USD">$ USD</option>
                        <option value="GBP">£ GBP</option>
                        <option value="MAD">DH MAD</option>
                        <option value="JPY">¥ JPY</option>
                        <option value="CHF">CHF</option>
                        <option value="CAD">$ CAD</option>
                      </select>
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
                  <div class="mb-3">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Allergies (optionnel) - ex: Gluten, Lactose, Fruits à coque"
                      [(ngModel)]="newItem.allergies"
                      name="allergies">
                    <small class="text-muted">Indiquez les allergènes présents dans ce plat</small>
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

            <div *ngFor="let item of getSortedMenuItems()" class="card mb-3">
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
                    <div *ngIf="item.allergies" class="mb-2">
                      <small class="text-warning">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        <strong>Allergènes:</strong> {{ item.allergies }}
                      </small>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="h5 text-success me-3">
                        {{ item.price }}
                        <span class="fs-6">{{ getCurrencySymbol(item.currency) }}</span>
                      </span>
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

  // Données statiques
  staticRestaurant: Restaurant = {
    id: 1,
    name: 'Le Gourmet Français',
    description: 'Restaurant français authentique avec une cuisine moderne',
    logoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&h=80&fit=crop&crop=center'
  };

  staticMenuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Coq au Vin',
      description: 'Coq fermier mijoté au vin rouge avec légumes de saison',
      price: 24.50,
      currency: 'EUR',
      category: 'Plats principaux',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
      allergies: 'Sulfites'
    },
    {
      id: 2,
      name: 'Bouillabaisse',
      description: 'Soupe de poissons traditionnelle marseillaise',
      price: 28.00,
      currency: 'EUR',
      category: 'Plats principaux',
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=300&h=200&fit=crop',
      allergies: 'Poissons, Crustacés'
    },
    {
      id: 3,
      name: 'Tarte Tatin',
      description: 'Tarte aux pommes caramélisées servie tiède',
      price: 8.50,
      currency: 'EUR',
      category: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      name: 'Foie Gras Poêlé',
      description: 'Escalope de foie gras poêlée aux figues',
      price: 32.00,
      currency: 'EUR',
      category: 'Entrées',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop'
    }
  ];

  staticQrCodes: QrCode[] = [];

  newItem: MenuItemDTO = {
    name: '',
    description: '',
    price: 0,
    currency: 'EUR',
    category: '',
    imageUrl: '',
    allergies: ''
  };

  qrRequest = {
    tableNumber: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService  // Gardé pour usage futur
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRestaurantData(id);
  }

  async loadRestaurantData(_id: number): Promise<void> {
    // Simulation d'un chargement (id non utilisé pour les données statiques)
    setTimeout(async () => {
      this.restaurant = this.staticRestaurant;
      this.menuItems = [...this.staticMenuItems];
      
      // Générer des QR codes initiaux s'ils n'existent pas
      if (this.staticQrCodes.length === 0) {
        await this.generateInitialQrCodes();
      }
      
      this.qrCodes = [...this.staticQrCodes];
      this.loading = false;
    }, 500);
  }

  async generateInitialQrCodes(): Promise<void> {
    try {
      // Générer 2 QR codes par défaut pour les tables 1 et 2
      for (let i = 1; i <= 2; i++) {
        const menuUrl = `http://44.219.124.242/menu/${this.staticRestaurant.id}?table=${i}`;
        const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
          errorCorrectionLevel: 'M',
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 256
        });

        this.staticQrCodes.push({
          id: i,
          qrCodeData: qrCodeDataUrl,
          tableNumber: i.toString(),
          menuUrl: menuUrl
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération des QR codes initiaux:', error);
    }
  }

  // Version commentée pour le backend futur
  /*
  async loadRestaurantData(id: number): Promise<void> {
    try {
      const [restaurant, menuItems, qrCodes] = await Promise.all([
        firstValueFrom(this.apiService.getRestaurant(id)),
        firstValueFrom(this.apiService.getMenu(id)),
        firstValueFrom(this.apiService.getQrCodes(id))
      ]);
      
      this.restaurant = restaurant!;
      this.menuItems = menuItems!;
      this.qrCodes = qrCodes!;
      this.loading = false;
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      this.loading = false;
    }
  }
  */

  addMenuItem(): void {
    if (!this.restaurant) return;

    // Ajouter le nouveau plat aux données statiques
    const newId = Math.max(...this.menuItems.map(item => item.id)) + 1;
    const newMenuItem: MenuItem = {
      id: newId,
      name: this.newItem.name,
      description: this.newItem.description,
      price: this.newItem.price,
      currency: this.newItem.currency,
      category: this.newItem.category,
      imageUrl: this.newItem.imageUrl,
      allergies: this.newItem.allergies
    };

    this.menuItems.push(newMenuItem);
    this.staticMenuItems.push(newMenuItem);
    this.cancelAddItem();

    // Version commentée pour le backend futur
    /*
    this.apiService.addMenuItem(this.restaurant.id, this.newItem).subscribe({
      next: () => {
        this.loadRestaurantData(this.restaurant!.id);
        this.cancelAddItem();
      },
      error: (error: any) => {
        console.error('Erreur lors de l\'ajout:', error);
      }
    });
    */
  }

  cancelAddItem(): void {
    this.showAddItem = false;
    this.newItem = {
      name: '',
      description: '',
      price: 0,
      currency: 'EUR',
      category: '',
      imageUrl: '',
      allergies: ''
    };
  }

  async generateQrCode(): Promise<void> {
    if (!this.restaurant) return;

    // Générer un nouveau QR code localement
    const newId = Math.max(...this.qrCodes.map(qr => qr.id)) + 1;
    const tableNumber = this.qrRequest.tableNumber || newId.toString();
    
    // Créer l'URL du menu avec l'adresse IP publique
    const menuUrl = `http://44.219.124.242/menu/${this.restaurant.id}${tableNumber ? '?table=' + tableNumber : ''}`;
    
    try {
      // Générer un vrai QR code avec la librairie qrcode
      const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      const newQrCode: QrCode = {
        id: newId,
        qrCodeData: qrCodeDataUrl,
        tableNumber: tableNumber,
        menuUrl: menuUrl
      };

      this.qrCodes.push(newQrCode);
      this.staticQrCodes.push(newQrCode);
      this.showQrGenerator = false;
      this.qrRequest = { tableNumber: '' };
      
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    }

    // Version commentée pour le backend futur
    /*
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
    */
  }


  deleteMenuItem(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      // Supprimer de la liste actuelle
      this.menuItems = this.menuItems.filter(item => item.id !== id);
      // Supprimer aussi des données statiques
      this.staticMenuItems = this.staticMenuItems.filter(item => item.id !== id);

      // Version commentée pour le backend futur
      /*
      this.apiService.deleteMenuItem(id).subscribe({
        next: () => {
          this.loadRestaurantData(this.restaurant!.id);
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
      */
    }
  }

  downloadQrCode(qr: QrCode): void {
    // Créer un lien de téléchargement pour le QR code
    const link = document.createElement('a');
    link.download = `qr-code-table-${qr.tableNumber || 'menu'}-${this.restaurant?.name || 'restaurant'}.png`;
    link.href = qr.qrCodeData;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getCurrencySymbol(currency?: string): string {
    const currencyMap: { [key: string]: string } = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'MAD': 'DH',
      'JPY': '¥',
      'CHF': 'CHF',
      'CAD': '$'
    };
    return currencyMap[currency || 'EUR'] || '€';
  }

  getSortedMenuItems(): MenuItem[] {
    // Ordre souhaité des catégories
    const categoryOrder = [
      'Entrées',
      'Plats principaux', 
      'Desserts',
      'Boissons',
      'Menu du jour',
      'Autres'
    ];

    return this.menuItems.sort((a, b) => {
      const categoryA = a.category || 'Autres';
      const categoryB = b.category || 'Autres';
      
      const indexA = categoryOrder.indexOf(categoryA);
      const indexB = categoryOrder.indexOf(categoryB);
      
      // Si une catégorie n'est pas dans l'ordre défini, la mettre à la fin
      const finalIndexA = indexA === -1 ? categoryOrder.length : indexA;
      const finalIndexB = indexB === -1 ? categoryOrder.length : indexB;
      
      return finalIndexA - finalIndexB;
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
