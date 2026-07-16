import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { X, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useDeleteAccount } from '@/lib/queries/account'

interface Props {
  open:    boolean
  onClose: () => void
}

const CONFIRM_WORD = 'ELIMINA'

export function DeleteAccountModal({ open, onClose }: Props) {
  const deleteAccount = useDeleteAccount()
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')

  if (!open) return null

  const isBusy = deleteAccount.isPending
  const canConfirm = confirmText.trim().toUpperCase() === CONFIRM_WORD

  const handleClose = () => {
    if (isBusy) return
    setConfirmText('')
    onClose()
  }

  const handleDelete = async () => {
    if (!canConfirm) return
    try {
      await deleteAccount.mutateAsync()
      toast.success('Account eliminato definitivamente.')

      // La sessione server non esiste più (utente eliminato) — signOut()
      // può fallire lato API in questo caso. Ripuliamo comunque lo stato
      // locale sotto, a prescindere dall'esito, per non lasciare l'app
      // "loggata" verso un account che non c'è più.
      try {
        await supabase.auth.signOut()
      } catch {
        // Atteso se l'utente non esiste più lato server — non bloccante.
      }
      useAuthStore.setState({ user: null, profile: null })
      navigate('/', { replace: true })
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Eliminazione non riuscita. Riprova o contatta il supporto.'
      toast.error(message)
    }
  }

  // Portal su document.body, stesso pattern di UpgradeModal — nessun
  // stacking context antenato può intrappolare la modale.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
              <AlertTriangle size={18} className="text-red-600" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900">Elimina account</h2>
              <p className="text-sm text-slate-600 mt-1">
                Azione irreversibile. Verranno eliminati definitivamente tutti i tuoi animali,
                dati sanitari, foto e documenti. Se hai un abbonamento attivo verrà cancellato prima.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isBusy}
            aria-label="Chiudi"
            className="p-1 text-slate-500 hover:text-slate-600 disabled:opacity-40 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">
            Digita <span className="font-bold text-red-600">{CONFIRM_WORD}</span> per confermare
          </label>
          <input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            disabled={isBusy}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60"
          />
        </div>

        <button
          onClick={handleDelete}
          disabled={!canConfirm || isBusy}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-2xl py-3 text-sm font-semibold transition-colors"
        >
          {isBusy ? <Loader2 size={16} className="animate-spin" /> : null}
          {isBusy ? 'Eliminazione in corso…' : 'Elimina definitivamente'}
        </button>
      </div>
    </div>,
    document.body,
  )
}
