import { Component } from '@angular/core';

@Component({
  selector: 'lib-ui',
  standalone: true,
  imports: [],
  template: `
    <span class="badge"><ng-content /></span>
  `,
  styles: `
    .badge {
      display: inline-block;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      background: var(--mfe-accent, #eef);
      color: var(--mfe-accent-text, #223);
      font-size: 0.85rem;
    }
  `,
})
export class Ui {

}
