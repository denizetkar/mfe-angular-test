import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ui } from 'ui';

@Component({
  standalone: true,
  imports: [RouterLink, Ui],
  template: `
    <h2>Checkout</h2>
    <p>This route subtree is owned by the <strong>checkout</strong> remote.</p>

    <p><lib-ui>remote: checkout</lib-ui></p>
    <a routerLink="/checkout/review">Go to review</a>
  `
})
export class CheckoutHomeComponent {}
