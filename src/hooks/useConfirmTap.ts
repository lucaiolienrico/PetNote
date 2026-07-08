import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_WINDOW_MS = 3000

/**
 * Pattern "tocca di nuovo per confermare": primo tap arma una key, secondo tap
 * (sulla stessa key) esegue l'azione. Il timer di auto-disarm viene sempre
 * ripulito — sia al cambio key sia allo smontaggio — per evitare setState
 * su componente smontato (era duplicato in 4 punti, ognuno senza cleanup).
 *
 * Uso singolo (un solo pulsante nella pagina): tap('_', onConfirm), isArmed('_')
 * Uso in lista (un pulsante per riga):         tap(item.id, onConfirm), isArmed(item.id)
 */
export function useConfirmTap(windowMs = DEFAULT_WINDOW_MS) {
  const [armedKey, setArmedKey] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const tap = useCallback((key: string, onConfirm: () => void) => {
    clearTimeout(timerRef.current)
    if (armedKey !== key) {
      setArmedKey(key)
      timerRef.current = setTimeout(() => setArmedKey(null), windowMs)
      return
    }
    setArmedKey(null)
    onConfirm()
  }, [armedKey, windowMs])

  const isArmed = useCallback((key: string) => armedKey === key, [armedKey])

  return { tap, isArmed }
}
