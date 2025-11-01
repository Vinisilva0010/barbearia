// Service Worker para Barbearia Oficial PWA
const CACHE_NAME = 'barbearia-app-v1.0.0';
const STATIC_CACHE = 'barbearia-static-v1.0.0';
const DYNAMIC_CACHE = 'barbearia-dynamic-v1.0.0';

// Arquivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-384x384.svg',
  '/icons/icon-144x144.svg',
  '/icons/icon-128x128.svg',
  '/icons/icon-96x96.svg',
  '/icons/icon-72x72.svg',
  '/icons/scissors-icon.svg',
  '/icons/shortcut-book.svg',
  '/icons/shortcut-bookings.svg'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando arquivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalação concluída');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro na instalação:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remove caches antigos
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativação concluída');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro na ativação:', error);
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para diferentes tipos de recursos
  if (request.method === 'GET') {
    // Arquivos estáticos - Cache First
    if (STATIC_FILES.includes(url.pathname) || url.pathname.startsWith('/icons/')) {
      event.respondWith(cacheFirst(request));
    }
    // API calls - Network First
    else if (url.pathname.startsWith('/api/') || url.hostname.includes('firebase')) {
      event.respondWith(networkFirst(request));
    }
    // Páginas HTML - Network First com fallback
    else if (request.headers.get('accept').includes('text/html')) {
      event.respondWith(networkFirstWithFallback(request));
    }
    // Outros recursos - Stale While Revalidate
    else {
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First Error:', error);
    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network First: Tentando cache...');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Estratégia Network First com Fallback
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('🌐 Network First with Fallback: Tentando cache...');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback para index.html para SPA
    const fallbackResponse = await caches.match('/index.html');
    if (fallbackResponse) {
      return fallbackResponse;
    }
    return new Response('Aplicação não disponível offline', { status: 503 });
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Se a rede falhar, retorna o cache se disponível
    return cachedResponse || new Response('Recurso não disponível', { status: 503 });
  });
  
  return cachedResponse || fetchPromise;
}

// Limpeza de cache periódica
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanOldCaches();
  }
});

// Função para limpeza de cache
async function cleanOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const validCaches = [STATIC_CACHE, DYNAMIC_CACHE];
    
    const deletePromises = cacheNames
      .filter(cacheName => !validCaches.includes(cacheName))
      .map(cacheName => caches.delete(cacheName));
    
    await Promise.all(deletePromises);
    console.log('🧹 Service Worker: Cache limpo');
  } catch (error) {
    console.error('❌ Service Worker: Erro na limpeza do cache:', error);
  }
}

// ========================================
// SISTEMA DE NOTIFICAÇÕES PWA PROFISSIONAL
// ========================================

// Manipulador de mensagens do cliente para criar notificações
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    
    // Configurações padrão para notificações
    const notificationOptions = {
      body: options.body || '',
      icon: options.icon || '/icons/icon-192x192.svg',
      badge: options.badge || '/icons/icon-72x72.svg',
      vibrate: options.vibrate || [200, 100, 200],
      tag: options.tag || 'barbearia-notification',
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      data: {
        url: options.url || '/',
        dateOfArrival: Date.now(),
        ...options.data
      },
      actions: options.actions || [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/icons/icon-96x96.svg'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icons/icon-72x72.svg'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(title, notificationOptions)
        .then(() => {
          console.log('✅ Notificação enviada:', title);
        })
        .catch((error) => {
          console.error('❌ Erro ao enviar notificação:', error);
        })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanOldCaches();
  }
});

// Notificações push (para futuras funcionalidades de push notifications)
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Você tem uma nova atualização!',
        icon: data.icon || '/icons/icon-192x192.svg',
        badge: data.badge || '/icons/icon-72x72.svg',
        vibrate: data.vibrate || [200, 100, 200],
        tag: data.tag || 'push-notification',
        requireInteraction: data.requireInteraction || false,
        data: {
          url: data.url || '/',
          dateOfArrival: Date.now(),
          primaryKey: data.primaryKey
        },
        actions: [
          {
            action: 'open',
            title: 'Ver Detalhes',
            icon: '/icons/icon-96x96.svg'
          },
          {
            action: 'close',
            title: 'Fechar',
            icon: '/icons/icon-72x72.svg'
          }
        ]
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Barbearia Oficial', options)
      );
    } catch (error) {
      console.error('❌ Erro ao processar push notification:', error);
    }
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Clique na notificação:', event.action);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  if (event.action === 'close') {
    // Apenas fecha a notificação
    return;
  }
  
  // Abrir ou focar na janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Procurar por uma janela já aberta
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não encontrou, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('❌ Erro ao abrir janela:', error);
      })
  );
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notificação fechada:', event.notification.tag);
});

console.log('🔧 Service Worker: Carregado e pronto!');
