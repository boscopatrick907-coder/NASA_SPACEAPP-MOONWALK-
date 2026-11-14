import { Injectable, isDevMode, signal } from '@angular/core';

@Injectable({providedIn: 'root'})
export class OfflineService {
  readonly status = signal('Cache not prepared');
  readonly detail = signal('Offline assets have not been verified on this device.');
  readonly preparing = signal(false);
  async prepare(): Promise<void> {
    if (this.preparing()) return;
    // Development builds change frequently; caching them would hide your edits.
    if (isDevMode()) {
      this.status.set('Development mode');
      this.detail.set('Offline caching is enabled in the production build. See README.');
      return;
    }
    if (!('serviceWorker' in navigator)) {
      this.status.set('Offline unsupported'); this.detail.set('This browser has no Service Worker support.'); return;
    }
    this.preparing.set(true); this.status.set('Preparing offline pack');
    try {
      const base = new URL('./', document.baseURI);
      const registration = await navigator.serviceWorker.register(new URL('sw.js', base), {scope: base.pathname});
      const worker = registration.installing || registration.waiting || registration.active;
      if (worker && worker.state !== 'activated') {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Cache preparation timed out. Retry while online.')), 45000);
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') {clearTimeout(timer); resolve();}
            if (worker.state === 'redundant') {clearTimeout(timer); reject(new Error('Cache installation failed. Check local assets and retry.'));}
          });
        });
      }
      if (!registration.active) throw new Error('Offline worker is unavailable. Reload and retry.');
      const ready = await new Promise<boolean>((resolve, reject) => {
        const channel = new MessageChannel();
        const timer = setTimeout(() => reject(new Error('Could not verify cached assets.')), 10000);
        channel.port1.onmessage = event => {clearTimeout(timer); channel.port1.close(); resolve(event.data.ready === true);};
        registration.active!.postMessage({type: 'CHECK_CACHE'}, [channel.port2]);
      });
      this.status.set(ready ? 'Offline pack ready' : 'Offline pack not ready');
      this.detail.set(ready ? 'App, imagery and reference data cached on this device.' : 'Some offline assets are missing. Reconnect and retry.');
    } catch (error) {
      this.status.set('Offline pack not ready');
      this.detail.set(error instanceof Error ? error.message : 'Cache preparation failed.');
    } finally {this.preparing.set(false);}
  }
}
