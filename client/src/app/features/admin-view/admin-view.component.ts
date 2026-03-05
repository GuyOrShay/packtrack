import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-view.component.html',
  styleUrl: './admin-view.component.css',
})
export class AdminViewComponent {}