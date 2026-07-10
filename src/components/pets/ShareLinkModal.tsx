import { useState } from 'react'
import { X, Copy, Trash2, Check, Loader2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useShareLinks, useCreateShareLink, useDeleteShareLink,
} from '@/lib/queries/shareLinks'
import { useConfirmTap } from '@/hooks/useConfirmTap'
import { formatIt } from '@/lib/health'

interface Props {
  petId:   string
  petName: string
  open:    boolean
  onClose: () => void
}

type ExpiryOption = '7' | '30' | 'never'

const EXPIRY_LABEL: Record<ExpiryOption, string> = {
  '7':     '7 giorni',
  '30':    '30 giorni',
  never:   'Senza scadenza',
}

function expiryToIso(option: ExpiryOption): string | null {
  if (option === 'never') return null
  const days = parseInt(option, 10)
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function shareUrl(token: string): string {
  return `${window.location.origin}/shared/${token}`
}

export function ShareLinkModal({ petId, petName, open, onClose }: Props) {
  const { data: links, isLoading } = useShareLinks(open ? petId : undefined)
  const createLink = useCreateShareLink(petId)
  const deleteLink = useDeleteShareLink(petId)
  const { tap, isArmed } = useConfirmTap()

  const [expiry, setExpiry] = useState<ExpiryOption>('30')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!open) return null

  const onCreate = async () => {
    try {
      await createLink.mutateAsync(expiryToIso(expiry))
      toast.success('Link creato')
    } catch {
      toast.error('Creazione non riuscita')
    }
  }

  const onCopy = async (id: string, token: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl(token))
      setCopiedId(id)
      setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 2000)
    } catch {
      toast.error('Copia non riuscita — copia manualmente il link')
    }
  }

  const onDelete = (id: string) => tap(id, async () => {
    try {
      await deleteLink.mutateAsync(id)
      toast.success('Link revocato')
    } catch {
      toast.error('Revoca non riuscita')
    }
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Condividi {petName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Chiunque abbia il link vede la scheda sanitaria in sola lettura — utile per il veterinario. Nessun accesso account richiesto.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 space-y-3">
          <p className="text-xs font-medium text-gray-500">Nuovo link</p>
          <div className="flex gap-2">
            {(Object.keys(EXPIRY_LABEL) as ExpiryOption[]).map(opt => (
              <button
                key={opt}
                onClick={() => setExpiry(opt)}
                className={`flex-1 text-xs font-semibold rounded-xl py-2 transition-colors ${
                  expiry === opt
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {EXPIRY_LABEL[opt]}
              </button>
            ))}
          </div>
          <button
            onClick={onCreate}
            disabled={createLink.isPending}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {createLink.isPending
              ? <Loader2 size={16} className="animate-spin" />
              : <Share2 size={16} />}
            Crea link
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Link attivi</p>

          {isLoading && <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />}

          {!isLoading && links?.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Nessun link creato</p>
          )}

          {links?.map(link => {
            const isExpired = link.expires_at !== null && new Date(link.expires_at) < new Date()
            return (
              <div key={link.id} className="border border-gray-100 rounded-xl p-3 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-mono truncate ${isExpired ? 'text-gray-300 line-through' : 'text-gray-600'}`}>
                    {shareUrl(link.token)}
                  </p>
                  <p className={`text-xs mt-0.5 ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
                    {isExpired
                      ? 'Scaduto'
                      : link.expires_at
                        ? `Scade il ${formatIt(link.expires_at)}`
                        : 'Senza scadenza'}
                  </p>
                </div>
                <button
                  onClick={() => onCopy(link.id, link.token)}
                  disabled={isExpired}
                  aria-label="Copia link"
                  className="p-1.5 text-gray-400 hover:text-brand-600 disabled:opacity-30 flex-shrink-0"
                >
                  {copiedId === link.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => onDelete(link.id)}
                  aria-label="Revoca link"
                  className={`p-1.5 flex-shrink-0 ${isArmed(link.id) ? 'text-red-600' : 'text-gray-300'}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
