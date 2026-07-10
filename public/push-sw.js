// push-sw.js
// Script aggiuntivo iniettato nel Service Worker generato da vite-plugin-pwa
// via workbox.importScripts (vedi vite.config.ts). Gira nello stesso
// contesto `self` del SW principale — non serve un service worker separato,
// solo aggiungere i listener che Workbox generateSW non produce di default.

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'PetNote', body: event.data ? event.data.text() : '' }
  }

  const title = payload.title || 'PetNote'
  const options = {
    body: payload.body || '',
    icon: '/pwa-192x192.png',
    badge: '/badge-72x72.png',
    tag: payload.tag || 'petnote-reminder',
    data: { url: payload.url || '/app/dashboard' },
    // Evita di impilare 10 notifiche identiche se piu' reminder scadono
    // lo stesso giorno per lo stesso pet — Workbox non lo fa da solo.
    renotify: false,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || '/app/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se una tab PetNote e' gia' aperta, portala in focus invece di
      // aprirne una nuova (comportamento atteso su mobile/PWA installata).
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
