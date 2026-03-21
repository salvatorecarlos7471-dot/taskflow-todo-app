import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TaskFirestoreService {
  private db = getFirestore();
  private auth = getAuth();

  async getTasks(): Promise<Task[]> {
    const user = this.auth.currentUser;
    if (!user) return [];

    try {
      const q = query(
        collection(this.db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          title: data['title'] || '',
          category: data['category'] || 'personal',
          completed: data['completed'] || false,
          createdAt: data['createdAt']?.toDate() || new Date()
        });
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  async addTask(title: string, category: string): Promise<void> {
    const user = this.auth.currentUser;
    console.log('📝 SERVICE - addTask, usuario:', user?.uid);
    
    if (!user) {
      console.error('❌ SERVICE - Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    const taskData = {
      title,
      category,
      completed: false,
      userId: user.uid,
      createdAt: new Date()
    };
    
    console.log('📝 SERVICE - Datos a guardar:', taskData);
    
    try {
      const docRef = await addDoc(collection(this.db, 'tasks'), taskData);
      console.log('✅ SERVICE - Tarea agregada con ID:', docRef.id);
    } catch (error) {
      console.error('❌ SERVICE - Error al agregar:', error);
      throw error;
    }
  }

  async toggleTask(id: string, completed: boolean): Promise<void> {
    const taskRef = doc(this.db, 'tasks', id);
    await updateDoc(taskRef, { completed });
  }

  async deleteTask(id: string): Promise<boolean> {
    console.log('🔥 SERVICE - deleteTask INICIO, ID:', id);
    
    if (!id) {
      console.error('❌ ID vacío');
      return false;
    }
    
    try {
      const taskRef = doc(this.db, 'tasks', id);
      console.log('📝 Referencia del documento:', taskRef.path);
      
      await deleteDoc(taskRef);
      console.log('✅ Documento eliminado de Firestore');
      
      const checkRef = doc(this.db, 'tasks', id);
      const checkDoc = await getDoc(checkRef);
      
      if (!checkDoc.exists()) {
        console.log('✅ Verificación: Documento ya no existe');
        return true;
      } else {
        console.log('⚠️ Verificación: Documento aún existe');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      throw error;
    }
  }
}