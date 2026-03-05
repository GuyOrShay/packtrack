import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-driver-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './driver-view.component.html',
  styleUrl: './driver-view.component.css',
})
export class DriverViewComponent {}
