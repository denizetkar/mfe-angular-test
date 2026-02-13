import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ui } from 'ui';

@Component({
  standalone: true,
  imports: [RouterLink, Ui],
  template: `
    <h2>Catalog</h2>
    <p>This route subtree is owned by the <strong>catalog</strong> remote.</p>

    <p><lib-ui>remote: catalog</lib-ui></p>

    <a [routerLink]="['/catalog/details', 42]">Open details for id=42</a>
  `
})
export class CatalogHomeComponent {}
