import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage {
  notificationsEnabled = true;
  darkMode = false;

  constructor(
    private router: Router,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.notificationsEnabled = await this.storage.get('notificationsEnabled') || true;
  }

  async saveSettings() {
    await this.storage.set('notificationsEnabled', this.notificationsEnabled);
    alert('Configuración guardada');
    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}