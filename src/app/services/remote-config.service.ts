import { Injectable } from '@angular/core';
import { getRemoteConfig, fetchAndActivate, getValue, RemoteConfig } from 'firebase/remote-config';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {
  private remoteConfig: RemoteConfig;
  private currentValue: boolean = true;

  constructor() {
    this.remoteConfig = getRemoteConfig();
    this.remoteConfig.settings = {
      minimumFetchIntervalMillis: 0,
      fetchTimeoutMillis: 10000
    };
    this.remoteConfig.defaultConfig = {
      show_completed_tasks_feature: 'true'
    };
  }

  async init(): Promise<boolean> {
    try {
      await fetchAndActivate(this.remoteConfig);
      const value = getValue(this.remoteConfig, 'show_completed_tasks_feature');
      this.currentValue = value.asString() === 'true';
      console.log('✅ Remote Config - Mostrar completadas:', this.currentValue);
      return this.currentValue;
    } catch (error) {
      console.error('❌ Error Remote Config:', error);
      return true;
    }
  }

  getBoolean(key: string): boolean {
    return this.currentValue;
  }

  async refresh(): Promise<boolean> {
    return await this.init();
  }
}