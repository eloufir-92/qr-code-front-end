import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {RestaurantDTO} from '../models/resturaurant.model';
import {ApiService} from '../services/api.service';


@Component({
  selector: 'app-create-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="mb-4">
            <button class="btn btn-outline-secondary" (click)="goBack()">
              <i class="fas fa-arrow-left me-2"></i>Retour au dashboard
            </button>
            <h1 class="mt-3">Créer un restaurant</h1>
          </div>

          <div class="card shadow">
            <div class="card-body">
              <form (ngSubmit)="onSubmit()" #restaurantForm="ngForm">
                <div class="mb-3">
                  <label for="name" class="form-label">Nom du restaurant *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    name="name"
                    [(ngModel)]="restaurant.name"
                    required
                    #name="ngModel"
                    placeholder="Ex: Chez Mario">
                  <div *ngIf="name.invalid && name.touched" class="text-danger mt-1">
                    Le nom est obligatoire
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    id="description"
                    name="description"
                    [(ngModel)]="restaurant.description"
                    rows="3"
                    placeholder="Décrivez votre restaurant..."></textarea>
                </div>

                <div class="mb-4">
                  <label for="logoUrl" class="form-label">URL du logo</label>
                  <input
                    type="url"
                    class="form-control"
                    id="logoUrl"
                    name="logoUrl"
                    [(ngModel)]="restaurant.logoUrl"
                    placeholder="https://exemple.com/logo.jpg">
                </div>

                <div class="d-flex justify-content-end">
                  <button
                    type="submit"
                    class="btn btn-success"
                    [disabled]="loading || !restaurantForm.form.valid">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Création...' : 'Créer le restaurant' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreateRestaurantComponent {
  restaurant: RestaurantDTO = {
    name: '',
    description: '',
    logoUrl: ''
  };
  loading = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    this.apiService.createRestaurant(this.restaurant).subscribe({
      next: (restaurant: { id: any; }) => {
        this.router.navigate(['/restaurant', restaurant.id]);
      },
      error: (error: any) => {
        console.error('Erreur lors de la création:', error);
        alert('Erreur lors de la création du restaurant');
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
