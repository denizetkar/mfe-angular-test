import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  styles: [
    `
      :host {
        display: block;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
      .title {
        font-weight: 600;
      }
      code {
        background: #f6f6f6;
        padding: 0.1rem 0.25rem;
        border-radius: 4px;
      }
    `
  ],
  template: `
    <div class="title">Remote unavailable</div>
    <p>
      Could not load remote <code>{{ remoteName() }}</code>.
    </p>
    <p>
      <a routerLink="/">Go home</a>
    </p>
  `
})
export class RemoteFallbackComponent {
  private readonly route = inject(ActivatedRoute);
  readonly remoteName = computed(() => (this.route.snapshot.data['remoteName'] as string) ?? 'unknown');
}

