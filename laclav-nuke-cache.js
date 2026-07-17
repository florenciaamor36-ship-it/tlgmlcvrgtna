// La Clave Chat - Cache Nuke
// Limpia caches y service workers viejos para evitar versiones rotas.
(function() {
  'use strict';
  const VERSION = '2.0.0';
  const STORAGE_KEY = 'laclav_version';

  try {
    const prev = localStorage.getItem(STORAGE_KEY);
    if (prev !== VERSION) {
      // Borrar caches de Service Worker
      if ('caches' in window) {
        caches.keys().then(function(names) {
          names.forEach(function(n) { caches.delete(n); });
        });
      }
      // Desregistrar service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(regs) {
          regs.forEach(function(r) { r.unregister(); });
        });
      }
      localStorage.setItem(STORAGE_KEY, VERSION);
    }
  } catch (e) {
    // No hacer nada si falla (modo privado, etc.)
  }
})();
