import { Routes } from '@angular/router';
import {DashboardComponent} from './components/dashboard.component';
import {CreateRestaurantComponent} from './components/create-restaurant.component';
import {MenuViewComponent} from './components/menu-view.component';
import {RestaurantDetailComponent} from './components/restaurant-detail.component';



export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'create', component: CreateRestaurantComponent },
  { path: 'restaurant/:id', component: RestaurantDetailComponent },
  { path: 'menu/:id', component: MenuViewComponent },
  { path: '**', redirectTo: '' }
];
