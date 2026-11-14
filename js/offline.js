export async function prepareOffline({ onStatus }) {
  if (!('serviceWorker' in navigator)) {
    onStatus({ready: false, message: 'Offline cache unsupported in this browser.'});
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), {scope: new URL('../', import.meta.url).pathname});
    const worker = registration.installing || registration.waiting || registration.active;
    if (worker && worker.state !== 'activated') {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Offline cache preparation timed out; retry while online.')), 45000);
        worker.addEventListener('statechange', () => {
          if (worker.state === 'activated') { clearTimeout(timer); resolve(); }
          if (worker.state === 'redundant') { clearTimeout(timer); reject(new Error('Cache installation failed; check local assets and retry.')); }
        });
      });
    }
    const active = registration.active;
    if (!active) throw new Error('No active offline worker. Reload and retry.');
    const ready = await new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => reject(new Error('Could not verify cached assets. Retry.')), 10000);
      channel.port1.onmessage = event => {clearTimeout(timer); channel.port1.close(); resolve(event.data.ready === true);};
      active.postMessage({type: 'CHECK_CACHE'}, [channel.port2]);
    });
    onStatus({ready, message: ready ? 'App, imagery and reference data cached on this device.' : 'Offline assets are incomplete. Reconnect and retry.'});
  } catch (error) {
    onStatus({ready: false, message: error.message});
  }
}
