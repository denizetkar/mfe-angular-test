import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>Shell</h2>
    <p>This is the host. Choose a remote:</p>
    <ul>
      <li><a routerLink="/catalog">Catalog</a></li>
      <li><a routerLink="/checkout">Checkout</a></li>
    </ul>
  `
})
export class HomeComponent {}

