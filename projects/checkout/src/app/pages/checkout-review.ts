import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>Review</h2>
    <p>Imagine payment + order confirmation here.</p>
    <a routerLink="/checkout">Back</a>
  `
})
export class CheckoutReviewComponent {}

