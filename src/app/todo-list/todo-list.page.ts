import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { getAuth } from 'firebase/auth';
import { TaskFirestoreService, Task } from '../services/task-firestore.service';
import { RemoteConfigService } from '../services/remote-config.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.page.html',
  styleUrls: ['./todo-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TodoListPage implements OnInit {
  tasks: Task[] = [];
  newTaskTitle = '';
  selectedCategory = 'personal';
  filterCategory: string = 'all';
  userName: string = '';
  profilePhoto: string = '';
  notificationCount: number = 0;
  showCompletedTasks: boolean = true;
  private auth = getAuth();

  constructor(
    private taskService: TaskFirestoreService,
    private remoteConfig: RemoteConfigService,
    private router: Router,
    private menuCtrl: MenuController,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.loadUserData();
    
    // Inicializar Remote Config
    await this.remoteConfig.init();
    this.showCompletedTasks = this.remoteConfig.getBoolean('show_completed_tasks_feature');
    console.log('🎯 FEATURE FLAG - Mostrar tareas completadas:', this.showCompletedTasks);
    
    this.auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        await this.loadTasks();
      }
    });
  }

  async refreshFeatureFlag() {
    await this.remoteConfig.init();
    this.showCompletedTasks = this.remoteConfig.getBoolean('show_completed_tasks_feature');
    alert(`Feature flag actualizado: ${this.showCompletedTasks ? 'Mostrar completadas' : 'Ocultar completadas'}`);
  }

  async loadUserData() {
    const user = this.auth.currentUser;
    if (user) {
      this.userName = await this.storage.get('userName') || user.email?.split('@')[0] || 'Usuario';
      this.profilePhoto = await this.storage.get('profilePhoto') || '';
    } else {
      this.userName = await this.storage.get('userName') || 'Usuario';
      this.profilePhoto = await this.storage.get('profilePhoto') || '';
    }
  }

  async loadTasks() {
    try {
      this.tasks = await this.taskService.getTasks();
      this.updateNotificationCount();
      console.log('Tareas cargadas:', this.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  updateNotificationCount() {
    this.notificationCount = this.tasks.filter(t => !t.completed).length;
  }

  async addTask() {
    if (this.newTaskTitle.trim()) {
      try {
        await this.taskService.addTask(this.newTaskTitle, this.selectedCategory);
        this.newTaskTitle = '';
        await this.loadTasks();
      } catch (error) {
        console.error('Error adding task:', error);
        alert('Error al agregar tarea');
      }
    }
  }

  async toggleTask(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      try {
        await this.taskService.toggleTask(id, !task.completed);
        await this.loadTasks();
      } catch (error) {
        console.error('Error toggling task:', error);
        alert('Error al actualizar tarea');
      }
    }
  }

  async deleteTask(id: string) {
    console.log('🗑️ ELIMINANDO tarea con ID:', id);
    
    if (!id) {
      console.error('❌ ID vacío');
      return;
    }
    
    try {
      const result = await this.taskService.deleteTask(id);
      console.log('✅ Resultado de eliminación:', result);
      
      setTimeout(async () => {
        await this.loadTasks();
      }, 500);
      
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      alert('Error al eliminar: ' + error);
    }
  }

  onFilterChange() {
    this.loadTasks();
  }

  getFilteredTasks(): Task[] {
    if (this.filterCategory === 'all') {
      return this.tasks;
    }
    return this.tasks.filter(task => task.category === this.filterCategory);
  }

  getCompletedTasks(): Task[] {
    return this.tasks.filter(task => task.completed);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.menuCtrl.close();
  }

  goToSettings() {
    this.router.navigate(['/settings']);
    this.menuCtrl.close();
  }

  showNotifications() {
    const pendingTasks = this.tasks.filter(t => !t.completed);
    if (pendingTasks.length > 0) {
      let message = '📋 TAREAS PENDIENTES:\n\n';
      pendingTasks.forEach((task, index) => {
        message += `${index + 1}. ${task.title} (${task.category})\n`;
      });
      alert(message);
    } else {
      alert('🎉 ¡Felicidades! No tienes tareas pendientes');
    }
    this.menuCtrl.close();
  }

  async logout() {
    await this.auth.signOut();
    await this.storage.remove('isLoggedIn');
    await this.storage.remove('userName');
    await this.storage.remove('profilePhoto');
    await this.storage.remove('userEmail');
    await this.storage.remove('gender');
    this.menuCtrl.close();
    this.router.navigate(['/login']);
  }
}