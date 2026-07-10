import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

// Converte la chiave VAPID base64url in Uint8Array, formato richiesto da
// PushManager.subscribe({ applicationServerKey }).
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const bytes = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) bytes[i] = rawData.charCodeAt(i)
  return bytes
}

export type PushSubscribeResult = 'ok' | 'denied' | 'unsupported' | 'no-user' | 'error'

interface UsePushNotificationsReturn {
  isSupported:      boolean
  permission:       NotificationPermission | 'unsupported'
  isSubscribed:     boolean
  isLoading:        boolean
  subscribe:        () => Promise<PushSubscribeResult>
  unsubscribe:      () => Promise<boolean>
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const user = useAuthStore(s => s.user)
  const isSupported = typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    isSupported ? Notification.permission : 'unsupported'
  )
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica se esiste già una subscription attiva per questo browser
  useEffect(() => {
    if (!isSupported) { setIsLoading(false); return }

    let cancelled = false
    ;(async () => {
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (!cancelled) setIsSubscribed(!!sub)
      } catch {
        if (!cancelled) setIsSubscribed(false)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [isSupported])

  const subscribe = useCallback(async (): Promise<PushSubscribeResult> => {
    if (!isSupported) return 'unsupported'
    if (!user) return 'no-user'
    if (!VAPID_PUBLIC_KEY) {
      console.error('VITE_VAPID_PUBLIC_KEY non configurata')
      return 'error'
    }

    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm !== 'granted') return 'denied'

    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // Cast esplicito: TS 5.7+ ha reso ArrayBufferView generico su
        // ArrayBufferLike (include SharedArrayBuffer), ma PushManager.subscribe
        // accetta solo BufferSource concreto — il valore a runtime è comunque
        // un ArrayBuffer normale (mai SharedArrayBuffer) da urlBase64ToUint8Array.
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      })

      const json = sub.toJSON()
      const keys = json.keys as { p256dh?: string; auth?: string } | undefined
      if (!json.endpoint || !keys?.p256dh || !keys?.auth) {
        throw new Error('PushSubscription incompleta')
      }

      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          user_id:     user.id,
          endpoint:    json.endpoint,
          keys_p256dh: keys.p256dh,
          keys_auth:   keys.auth,
        },
        { onConflict: 'user_id,endpoint' }
      )
      if (error) throw error

      setIsSubscribed(true)
      return 'ok'
    } catch (err) {
      console.error('Push subscribe failed:', err)
      return 'error'
    }
  }, [isSupported, user])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        const endpoint = sub.endpoint
        await sub.unsubscribe()
        if (user) {
          await supabase.from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', endpoint)
        }
      }
      setIsSubscribed(false)
      return true
    } catch (err) {
      console.error('Push unsubscribe failed:', err)
      return false
    }
  }, [isSupported, user])

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe }
}
