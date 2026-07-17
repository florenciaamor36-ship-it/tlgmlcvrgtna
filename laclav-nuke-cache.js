// La Clave Chat - Light Cache Refresh
// Solo fuerza a los navegadores a no usar versiones viejas sin romper la app.
(function() {
  'use strict';
  // No tocamos caches ni service workers. Solo agregamos un parametro de version
  // a las solicitudes que hace la app para forzar re-descarga si es necesario.
  // En realidad esto no es necesario si el index.html ya tiene ?v=2.0.0.
  // Dejamos el archivo como un placeholder no-op para no romper nada.
})();
