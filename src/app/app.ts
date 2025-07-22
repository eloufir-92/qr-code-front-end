import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-vh-100 bg-light">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'QR Menu';
}
