import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface Task {
  id: number;
  title: string;
  category: string;
  completed: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private _storage: Storage | null = null;
  private tasks: Task[] = [];

  constructor(private storage: Storage) {}

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    await this.loadTasks();
  }

  async loadTasks() {
    const savedTasks = await this._storage?.get('tasks');
    if (savedTasks) {
      this.tasks = savedTasks;
    }
  }

  async saveTasks() {
    await this._storage?.set('tasks', this.tasks);
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  getTasksByCategory(category: string): Task[] {
    if (category === 'all') return this.tasks;
    return this.tasks.filter(task => task.category === category);
  }

  async addTask(title: string, category: string) {
    const newTask: Task = {
      id: Date.now(),
      title,
      category,
      completed: false,
      createdAt: new Date()
    };
    this.tasks.push(newTask);
    await this.saveTasks();
  }

  async toggleTask(id: number) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      await this.saveTasks();
    }
  }

  async deleteTask(id: number) {
  console.log('Eliminando tarea con id:', id);
  this.tasks = this.tasks.filter(t => t.id !== id);
  await this.saveTasks();
  console.log('Tareas después de eliminar:', this.tasks);
}
}