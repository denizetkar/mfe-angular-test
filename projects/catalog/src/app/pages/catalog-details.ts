import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>Catalog details</h2>
    <p>id: {{ id() }}</p>
    <a routerLink="/catalog">Back</a>
  `
})
export class CatalogDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  readonly id = computed(() => this.route.snapshot.paramMap.get('id') ?? 'n/a');
}

