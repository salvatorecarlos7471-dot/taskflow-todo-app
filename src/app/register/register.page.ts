import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  private auth = getAuth();

  constructor(
    private storage: Storage,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {}

  async register() {
    if (!this.email || !this.password) {
      alert('Por favor ingresa tu correo y contraseña');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Registrando...'
    });
    await loading.present();

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      await this.storage.set('isLoggedIn', true);
      await this.storage.set('userEmail', this.email);
      await this.storage.set('userName', this.email.split('@')[0]);
      await loading.dismiss();
      alert('¡Registro exitoso! Bienvenido');
      this.navCtrl.navigateRoot(['/todo-list']);
    } catch (error: any) {
      await loading.dismiss();
      let errorMessage = 'Error al registrar';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      }
      alert(errorMessage);
    }
  }

  goToLogin() {
    this.navCtrl.navigateRoot(['/login']);
  }
}