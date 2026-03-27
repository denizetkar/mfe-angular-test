import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RemoteStatusBarComponent } from './remote-status-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RemoteStatusBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
