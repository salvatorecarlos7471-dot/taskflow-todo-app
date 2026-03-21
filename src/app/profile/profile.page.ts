import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  userName: string = '';
  userEmail: string = '';
  profilePhoto: string = '';
  gender: string = '';

  constructor(
    private router: Router,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.userName = await this.storage.get('userName') || '';
    this.userEmail = await this.storage.get('userEmail') || '';
    this.profilePhoto = await this.storage.get('profilePhoto') || '';
    this.gender = await this.storage.get('gender') || '';
  }

  async saveProfile() {
    await this.storage.set('userName', this.userName);
    await this.storage.set('userEmail', this.userEmail);
    await this.storage.set('profilePhoto', this.profilePhoto);
    await this.storage.set('gender', this.gender);
    alert('Perfil guardado exitosamente');
    this.router.navigate(['/todo-list']);
  }

  selectGender(gender: string) {
    this.gender = gender;
    if (gender === 'male') {
      this.profilePhoto = 'https://randomuser.me/api/portraits/men/1.jpg';
    } else if (gender === 'female') {
      this.profilePhoto = 'https://randomuser.me/api/portraits/women/1.jpg';
    } else {
      this.profilePhoto = '';
    }
  }

  goBack() {
    this.router.navigate(['/todo-list']);
  }
}