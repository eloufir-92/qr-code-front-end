import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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

    <!-- Menu du jour Popup -->
    <div *ngIf="showDailyMenuPopup" class="modal-overlay" (click)="closeDailyMenuPopup()">
      <div class="modal-content daily-menu-popup" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fas fa-star text-warning me-2"></i>Menu du Jour</h3>
          <button type="button" class="btn-close" (click)="closeDailyMenuPopup()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div *ngFor="let item of dailyMenuItems" class="daily-menu-item">
            <div class="row align-items-center">
              <div class="col-3" *ngIf="item.imageUrl">
                <img [src]="item.imageUrl" [alt]="item.name" class="img-fluid rounded">
              </div>
              <div class="col">
                <h5>{{ item.name }}</h5>
                <p class="text-muted small mb-1">{{ item.description }}</p>
                <span class="badge bg-success">{{ item.price }}€</span>
              </div>
            </div>
          </div>
          <div *ngIf="dailyMenuItems.length === 0" class="text-center py-3">
            <i class="fas fa-utensils fa-2x text-muted mb-2"></i>
            <p class="text-muted">Aucun plat du jour disponible aujourd'hui</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" (click)="closeDailyMenuPopup()">
            Fermer
          </button>
          <button *ngIf="dailyMenuItems.length > 0" type="button" class="btn btn-primary" (click)="scrollToCategory('Plats du jour')">
            Voir dans le menu
          </button>
        </div>
      </div>
    </div>

    <!-- Menu Content -->
    <div *ngIf="!loading" class="main-content" [class.shifted]="showBurgerMenu">
      <div class="min-vh-100 bg-light">
        <!-- Header -->
        <div class="bg-white shadow-sm position-relative">
        <!-- Menu Burger -->
        <button class="burger-menu-btn" [class.active]="showBurgerMenu" (click)="toggleBurgerMenu()">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- Burger Menu Sidebar -->
        <div class="burger-menu-sidebar" [class.show]="showBurgerMenu" (click)="onSidebarOverlayClick($event)">
          <div class="burger-menu-content" (click)="$event.stopPropagation()">
            <div class="burger-menu-header">
              <h4>Navigation</h4>
              <button class="btn-close" (click)="closeBurgerMenu()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="burger-menu-body">
              <ul class="nav-list">
                <li><a href="#" (click)="scrollToTop(); closeBurgerMenu()"><i class="fas fa-home me-2"></i>{{ translations.home }}</a></li>
                <li><a href="#" (click)="switchToTab('menu')"><i class="fas fa-bars me-2"></i>{{ translations.menu }}</a></li>
                <li><a href="#" (click)="switchToTab('events')"><i class="fas fa-calendar-week me-2"></i>{{ translations.events }}</a></li>
                <li><a href="#" (click)="showDailyMenuPopup = true; closeBurgerMenu()"><i class="fas fa-star me-2"></i>{{ translations.dailyMenu }}</a></li>
                <li *ngFor="let category of getSortedCategoryKeys()"
                    (click)="scrollToCategory(category); closeBurgerMenu()">
                  <a href="#"><i class="fas fa-utensils me-2"></i>{{ category }}</a>
                </li>
                <li><a href="#" (click)="goBack(); closeBurgerMenu()"><i class="fas fa-arrow-left me-2"></i>{{ translations.back }}</a></li>
                
                <!-- Language Selector in Burger Menu -->
                <li class="language-selector-section">
                  <div class="language-selector-header">
                    <i class="fas fa-globe me-2"></i>{{ translations.language }}
                  </div>
                  <div class="language-options">
                    <a *ngFor="let lang of languages" 
                       href="#" 
                       [class.active]="currentLanguage.code === lang.code"
                       (click)="changeLanguage(lang); $event.preventDefault(); closeBurgerMenu()">
                      <span class="flag-icon me-2">{{ lang.flag }}</span>{{ lang.name }}
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="container py-4 text-center">
          <div class="d-flex align-items-center justify-content-center">
            <img *ngIf="restaurant?.logoUrl"
                 [src]="restaurant?.logoUrl"
                 [alt]="restaurant?.name"
                 class="rounded-circle me-3 restaurant-logo"
                 style="width: 80px; height: 80px; object-fit: cover;">
            <div>
              <h1 class="display-5 mb-1 restaurant-name">{{ restaurant?.name }}</h1>
              <p *ngIf="restaurant?.description" class="text-muted mb-2">{{ restaurant?.description }}</p>
              <span *ngIf="tableNumber" class="badge bg-primary fs-6 table-badge">
                Table {{ tableNumber }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-container sticky-top bg-white border-bottom" [class.hidden-sidebar]="showBurgerMenu">
        <div class="container">
          <ul class="nav nav-tabs custom-tabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link" 
                      [class.active]="activeTab === 'menu'"
                      (click)="setActiveTab('menu')"
                      type="button">
                <i class="fas fa-utensils me-2"></i>{{ translations.menu }}
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" 
                      [class.active]="activeTab === 'events'"
                      (click)="setActiveTab('events')"
                      type="button">
                <i class="fas fa-calendar-week me-2"></i>{{ translations.events }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="container py-4">
        
        <!-- Menu Tab Content -->
        <div *ngIf="activeTab === 'menu'">
          <div *ngIf="Object.keys(groupedItems).length === 0" class="text-center py-5">
            <i class="fas fa-utensils fa-4x text-muted mb-3"></i>
            <h3 class="text-muted">{{ translations.menuInPreparation }}</h3>
          </div>

          <div *ngFor="let category of getSortedCategoryKeys()" class="mb-5 category-section" [id]="'category-' + category">
            <div class="card shadow-sm menu-card">
              <div class="card-header bg-primary text-white category-header">
                <h2 class="h4 mb-0">
                  <i class="fas fa-utensils me-2"></i>{{ category }}
                </h2>
              </div>
              <div class="card-body p-0">
                <div *ngFor="let item of groupedItems[category]; let last = last"
                     class="p-4 menu-item"
                     [class.border-bottom]="!last">
                  <div class="row align-items-start">
                    <div class="col-md-3" *ngIf="item.imageUrl">
                      <img [src]="item.imageUrl"
                           [alt]="item.name"
                           class="img-fluid rounded shadow-sm menu-item-image"
                           style="height: 120px; width: 100%; object-fit: cover;">
                    </div>
                    <div class="col">
                      <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                          <h3 class="h5 mb-2 text-dark menu-item-name">{{ item.name }}</h3>
                          <p *ngIf="item.description" class="text-muted mb-2 menu-item-description">{{ item.description }}</p>
                        </div>
                        <div class="text-end ms-3">
                          <span class="h4 text-success fw-bold menu-item-price">{{ item.price }}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Events Tab Content -->
        <div *ngIf="activeTab === 'events'">
          <div class="row">
            <div *ngFor="let event of weeklyEvents" class="col-lg-6 mb-4">
              <div class="card h-100 event-card">
                <div class="card-body">
                  <div class="d-flex align-items-start">
                    <div class="me-3">
                      <div class="event-icon">
                        <i class="fas fa-calendar-day"></i>
                      </div>
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="card-title mb-2">{{ event.title }}</h5>
                      <p class="text-primary mb-2">
                        <i class="fas fa-clock me-1"></i>{{ event.date }}
                      </p>
                      <p class="text-muted mb-0">{{ event.description }}</p>
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
    </div>

    <style>
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1050;
        animation: fadeIn 0.3s ease;
      }

      .modal-content {
        background: white;
        border-radius: 15px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .modal-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 15px 15px 0 0;
      }

      .modal-title {
        margin: 0;
        font-weight: 600;
      }

      .btn-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .modal-body {
        padding: 20px;
      }

      .daily-menu-item {
        margin-bottom: 20px;
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 10px;
        background: #f8f9fa;
        transition: transform 0.2s ease;
      }

      .daily-menu-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      .modal-footer {
        padding: 15px 20px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }

      .burger-menu-btn {
        position: absolute;
        top: 15px;
        left: 15px;
        width: 40px;
        height: 40px;
        background: #007bff;
        border: none;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 1050;
        transition: all 0.3s ease;
      }

      .burger-menu-btn span {
        width: 20px;
        height: 2px;
        background: white;
        margin: 2px 0;
        transition: all 0.3s ease;
        border-radius: 2px;
      }

      .burger-menu-btn.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }

      .burger-menu-btn.active span:nth-child(2) {
        opacity: 0;
      }

      .burger-menu-btn.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }

      /* Main Content Container */
      .main-content {
        transition: margin-left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        margin-left: 0;
      }

      .main-content.shifted {
        margin-left: 320px;
      }

      /* Burger Menu Sidebar */
      .burger-menu-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: 320px;
        height: 100vh;
        z-index: 1100;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      }

      .burger-menu-sidebar.show {
        transform: translateX(0);
      }

      .burger-menu-content {
        width: 100%;
        height: 100%;
        background: white;
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        border-right: 2px solid #e9ecef;
      }

      .burger-menu-header {
        padding: 25px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
      }

      .burger-menu-header h4 {
        margin: 0;
        font-weight: 600;
        font-size: 18px;
      }

      .burger-menu-body {
        flex: 1;
        padding: 0;
        overflow-y: auto;
      }

      .nav-list {
        list-style: none;
        padding: 15px 0;
        margin: 0;
      }

      .nav-list li {
        border-bottom: 1px solid #f0f0f0;
        margin: 0 15px;
        border-radius: 8px;
        margin-bottom: 5px;
      }

      .nav-list li:last-child {
        border-bottom: 1px solid #f0f0f0;
      }

      .nav-list a {
        display: block;
        padding: 15px 15px;
        color: #333;
        text-decoration: none;
        transition: all 0.3s ease;
        border-radius: 8px;
        font-weight: 500;
      }

      .nav-list a:hover {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #007bff;
        transform: translateX(8px);
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .menu-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: none;
        border-radius: 15px;
        overflow: hidden;
      }

      .menu-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      }

      .category-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border: none;
      }

      .menu-item {
        transition: background-color 0.2s ease;
      }

      .menu-item:hover {
        background-color: #f8f9fa;
      }

      .menu-item-image {
        transition: transform 0.3s ease;
      }

      .menu-item:hover .menu-item-image {
        transform: scale(1.05);
      }

      .restaurant-logo {
        transition: transform 0.3s ease;
      }

      .restaurant-logo:hover {
        transform: scale(1.1);
      }

      .restaurant-name {
        background: linear-gradient(45deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .table-badge {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      .category-section {
        scroll-margin-top: 100px;
      }

      /* Language Selector in Burger Menu */
      .language-selector-section {
        border-top: 2px solid #e9ecef;
        margin: 15px 15px 0;
        padding-top: 20px;
        background: #f8f9fa;
        border-radius: 12px;
        padding: 20px 15px 15px;
      }

      .language-selector-header {
        padding: 0 0 15px;
        color: #495057;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: center;
        border-bottom: 1px solid #dee2e6;
        margin-bottom: 10px;
      }

      .language-options {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .language-options a {
        display: block;
        padding: 12px 15px;
        color: #333;
        text-decoration: none;
        transition: all 0.3s ease;
        font-size: 14px;
        border-radius: 8px;
        text-align: center;
        font-weight: 500;
      }

      .language-options a:hover {
        background: #e9ecef;
        color: #007bff;
        transform: scale(1.02);
      }

      .language-options a.active {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
      }

      .language-options a.active:hover {
        background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
        transform: scale(1.02);
      }

      /* Custom Tabs */
      .custom-tabs {
        border-bottom: 2px solid #e9ecef;
        background: white;
      }

      .custom-tabs .nav-link {
        border: none;
        border-radius: 0;
        padding: 15px 25px;
        color: #6c757d;
        font-weight: 500;
        transition: all 0.3s ease;
        border-bottom: 3px solid transparent;
      }

      .custom-tabs .nav-link:hover {
        color: #007bff;
        background: #f8f9fa;
        border-bottom-color: #007bff;
      }

      .custom-tabs .nav-link.active {
        color: #007bff;
        background: white;
        border-bottom-color: #007bff;
        font-weight: 600;
      }

      .tabs-container {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 1000;
        position: relative;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }

      /* Masquer la navbar uniquement sur desktop quand sidebar ouverte */
      @media (min-width: 993px) {
        .tabs-container.hidden-sidebar {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
      }

      /* Sur mobile/tablette, garder la navbar visible */
      @media (max-width: 992px) {
        .tabs-container.hidden-sidebar {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
      }

      /* Event Cards */
      .event-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .event-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      }

      .event-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
      }

      @media (max-width: 992px) {
        /* Sur tablette et mobile, on utilise l'overlay au lieu du push */
        .main-content.shifted {
          margin-left: 0;
        }

        .burger-menu-sidebar {
          background: rgba(0, 0, 0, 0.5);
          width: 100%;
        }

        .burger-menu-sidebar.show {
          transform: translateX(0);
        }

        .burger-menu-content {
          width: 320px;
          margin-left: 0;
        }
      }

      @media (max-width: 768px) {
        .burger-menu-content {
          width: 280px;
        }

        .modal-content {
          margin: 20px;
          width: calc(100% - 40px);
        }

        .custom-tabs .nav-link {
          padding: 12px 20px;
          font-size: 14px;
        }

        .language-selector-section {
          margin: 10px 10px 0;
          padding: 15px 10px 10px;
        }

        .nav-list li {
          margin: 0 10px;
        }
      }

      @media (max-width: 480px) {
        .burger-menu-content {
          width: 260px;
        }
      }
    </style>
  `
})
export class MenuViewComponent implements OnInit {
  restaurant: Restaurant | null = null;
  menuItems: MenuItem[] = [];
  tableNumber: string | null = null;
  loading = true;
  groupedItems: { [key: string]: MenuItem[] } = {};
  showDailyMenuPopup = false;
  showBurgerMenu = false;
  dailyMenuItems: MenuItem[] = [];
  showLanguageDropdown = false;
  showWeeklyEvents = false;
  activeTab = 'menu';

  // Données statiques (même que restaurant-detail)
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

  languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' }
  ];

  currentLanguage = this.languages[0];

  weeklyEvents = [
    {
      title: 'Menu du Chef',
      date: 'Lundi - Mercredi',
      description: 'Découvrez nos spécialités préparées par notre chef étoilé'
    },
    {
      title: 'Happy Hour',
      date: 'Jeudi - Vendredi 17h-19h',
      description: '50% de réduction sur les boissons et apéritifs'
    },
    {
      title: 'Brunch du Weekend',
      date: 'Samedi - Dimanche 10h-14h',
      description: 'Brunch complet avec buffet à volonté'
    },
    {
      title: 'Soirée Live Music',
      date: 'Vendredi soir',
      description: 'Ambiance musicale avec nos artistes locaux'
    }
  ];

  translations = {
    events: 'Événements',
    weeklyEventsTitle: 'Événements de la semaine',
    menuInPreparation: 'Menu en cours de préparation...',
    menu: 'Menu',
    home: 'Accueil',
    dailyMenu: 'Menu du jour',
    back: 'Retour',
    language: 'Langue'
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tableNumber = this.route.snapshot.queryParamMap.get('table');
    this.loadMenuData(id);
  }

  loadMenuData(id: number): void {
    // Simulation d'un chargement avec données statiques
    setTimeout(() => {
      this.restaurant = this.staticRestaurant;
      this.menuItems = [...this.staticMenuItems];
      this.groupMenuItems();
      this.setupDailyMenu();
      this.loading = false;

      setTimeout(() => {
        if (this.dailyMenuItems.length > 0) {
          this.showDailyMenuPopup = true;
        }
      }, 1000);
    }, 500);

    // Version commentée pour le backend futur
    /*
    Promise.all([
      this.apiService.getRestaurant(id).toPromise(),
      this.apiService.getMenu(id).toPromise()
    ]).then(([restaurant, menuItems]) => {
      this.restaurant = restaurant!;
      this.menuItems = menuItems!;
      this.groupMenuItems();
      this.setupDailyMenu();
      this.loading = false;

      setTimeout(() => {
        if (this.dailyMenuItems.length > 0) {
          this.showDailyMenuPopup = true;
        }
      }, 1000);
    }).catch(error => {
      console.error('Erreur lors du chargement du menu:', error);
      this.loading = false;
    });
    */
  }

  groupMenuItems(): void {
    // Grouper les items par catégorie
    const unsortedGroups = this.menuItems.reduce((groups, item) => {
      const category = item.category || 'Autres';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as { [key: string]: MenuItem[] });

    // Trier les catégories dans l'ordre souhaité
    const categoryOrder = [
      'Entrées',
      'Plats principaux', 
      'Desserts',
      'Boissons',
      'Menu du jour',
      'Autres'
    ];

    this.groupedItems = {};
    
    // Ajouter les catégories dans l'ordre défini
    categoryOrder.forEach(category => {
      if (unsortedGroups[category]) {
        this.groupedItems[category] = unsortedGroups[category];
      }
    });

    // Ajouter les catégories non prévues à la fin
    Object.keys(unsortedGroups).forEach(category => {
      if (!categoryOrder.includes(category)) {
        this.groupedItems[category] = unsortedGroups[category];
      }
    });
  }

  setupDailyMenu(): void {
    // Données statiques pour le menu du jour
    this.dailyMenuItems = [
      {
        id: 999,
        name: 'Saumon grillé aux herbes',
        description: 'Filet de saumon frais grillé, accompagné de légumes de saison et sauce à l\'aneth',
        price: 18.50,
        category: 'Menu du jour',
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop'
      },
      {
        id: 1000,
        name: 'Risotto aux champignons',
        description: 'Risotto crémeux aux champignons porcini, parmesan et truffe',
        price: 16.00,
        category: 'Menu du jour',
        imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&h=200&fit=crop'
      },
      {
        id: 1001,
        name: 'Tarte tatin maison',
        description: 'Tarte tatin traditionnelle aux pommes, servie avec une boule de glace vanille',
        price: 8.50,
        category: 'Menu du jour',
        imageUrl: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=300&h=200&fit=crop'
      }
    ];
  }

  closeDailyMenuPopup(): void {
    this.showDailyMenuPopup = false;
  }

  toggleBurgerMenu(): void {
    this.showBurgerMenu = !this.showBurgerMenu;
  }

  closeBurgerMenu(): void {
    this.showBurgerMenu = false;
  }

  onSidebarOverlayClick(event: Event): void {
    // Sur mobile/tablette, fermer la sidebar en cliquant sur l'overlay
    if (window.innerWidth <= 992) {
      this.closeBurgerMenu();
    }
  }

  scrollToCategory(category: string): void {
    const element = document.getElementById('category-' + category);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.showDailyMenuPopup = false;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  switchToTab(tab: string): void {
    this.setActiveTab(tab);
    // Fermer la sidebar après un petit délai pour une meilleure UX
    setTimeout(() => {
      this.closeBurgerMenu();
    }, 100);
  }

  changeLanguage(language: any): void {
    this.currentLanguage = language;
    
    const translationsMap: any = {
      'fr': {
        events: 'Événements',
        weeklyEventsTitle: 'Événements de la semaine',
        menuInPreparation: 'Menu en cours de préparation...',
        menu: 'Menu',
        home: 'Accueil',
        dailyMenu: 'Menu du jour',
        back: 'Retour',
        language: 'Langue'
      },
      'en': {
        events: 'Events',
        weeklyEventsTitle: 'Weekly Events',
        menuInPreparation: 'Menu in preparation...',
        menu: 'Menu',
        home: 'Home',
        dailyMenu: 'Daily Menu',
        back: 'Back',
        language: 'Language'
      },
      'es': {
        events: 'Eventos',
        weeklyEventsTitle: 'Eventos de la semana',
        menuInPreparation: 'Menú en preparación...',
        menu: 'Menú',
        home: 'Inicio',
        dailyMenu: 'Menú del día',
        back: 'Atrás',
        language: 'Idioma'
      },
      'ar': {
        events: 'الأحداث',
        weeklyEventsTitle: 'أحداث الأسبوع',
        menuInPreparation: 'القائمة قيد التحضير...',
        menu: 'القائمة',
        home: 'الرئيسية',
        dailyMenu: 'قائمة اليوم',
        back: 'رجوع',
        language: 'اللغة'
      }
    };

    this.translations = translationsMap[language.code] || translationsMap['fr'];
    
    if (language.code === 'ar') {
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.setAttribute('dir', 'ltr');
    }
  }

  getSortedCategoryKeys(): string[] {
    // Retourner les clés dans l'ordre déjà trié par groupMenuItems()
    return Object.keys(this.groupedItems);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  Object = Object;
}
