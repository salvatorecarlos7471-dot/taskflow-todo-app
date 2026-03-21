import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  private auth = getAuth();

  constructor(
    private storage: Storage,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const isLoggedIn = await this.storage.get('isLoggedIn');
    if (isLoggedIn) {
      this.navCtrl.navigateRoot(['/todo-list']);
    }
  }

  async login() {
    if (!this.email || !this.password) {
      alert('Por favor ingresa tu correo y contraseña');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...'
    });
    await loading.present();

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      await this.storage.set('isLoggedIn', true);
      await this.storage.set('userEmail', this.email);
      await this.storage.set('userName', userCredential.user.displayName || this.email.split('@')[0]);
      await loading.dismiss();
      alert('¡Bienvenido!');
      this.navCtrl.navigateRoot(['/todo-list']);
    } catch (error: any) {
      await loading.dismiss();
      alert('Error: ' + error.message);
    }
  }

  async register() {
    if (!this.email || !this.password) {
      alert('Por favor ingresa tu correo y contraseña');
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
      await this.storage.set('userName', userCredential.user.displayName || this.email.split('@')[0]);
      await loading.dismiss();
      alert('¡Registro exitoso!');
      this.navCtrl.navigateRoot(['/todo-list']);
    } catch (error: any) {
      await loading.dismiss();
      alert('Error: ' + error.message);
    }
}
    goToRegister() {
    this.navCtrl.navigateRoot(['/register']);
  }
}