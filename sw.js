const CACHE_NAME = 'todo-v2'; // ← versión nueva para forzar actualización

// Solo cachear assets estáticos, NUNCA rutas de la app ni API
const STATIC_ASSETS = [
  '/manifest.json',
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Forzar activación inmediata sin esperar
  self.skipWaiting();
});

// Activación — borrar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)) // borra todo lo viejo
      )
    )
  );
  self.clients.claim();
});

// Estrategia fetch
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ✅ NUNCA interceptar llamadas a la API
  if (url.pathname.startsWith('/api/')) {
    return; // deja que vaya directo a la red
  }

  // ✅ NUNCA interceptar navegación a rutas de la app
  // (login, dashboard, admin, register, etc.)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        // Solo si no hay red, devolver index.html cacheado
        caches.match('/index.html').then((r) => r || fetch(event.request))
      )
    );
    return;
  }

  // Para assets estáticos: cache first, luego red
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Cachear solo assets estáticos válidos
        if (
          response.ok &&
          (url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.png') ||
           url.pathname.endsWith('.jpg') ||
           url.pathname.endsWith('.svg') ||
           url.pathname.endsWith('.webp') ||
           url.pathname.endsWith('.ico') ||
           url.pathname.endsWith('manifest.json'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});