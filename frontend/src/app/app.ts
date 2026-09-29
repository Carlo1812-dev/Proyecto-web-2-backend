import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navegacion } from './navegacion/navegacion';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Navegacion, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
