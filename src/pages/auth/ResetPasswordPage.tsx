import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const schema = z
  .object({
    password: z.string().min(6, 'Minimo 6 caratteri'),
    confirm:  z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Le password non coincidono',
    path: ['confirm'],
  })
type FormData = z.infer<typeof schema>

type Status = 'checking' | 'ready' | 'invalid'

/**
 * Pagina raggiunta dal link di recovery nell'email. NON è sotto RequireGuest:
 * il link stabilisce una sessione temporanea di recovery (user diventa truthy)
 * e RequireGuest la scaccerebbe verso /app/dashboard prima di poter impostare
 * la nuova password. Per lo stesso motivo ha un guscio proprio, non AuthLayout.
 */
export function ResetPasswordPage() {
  useDocumentMeta({
    title: 'Reimposta password — PetNote',
    description: 'Imposta una nuova password per il tuo account PetNote.',
    canonicalPath: '/reimposta-password',
    noindex: true,
  })

  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    // supabase-js (detectSessionInUrl) processa il fragment del link e emette
    // PASSWORD_RECOVERY. L'evento può scattare PRIMA del mount: getSession() fa
    // da fallback. Nessuna sessione => link assente o scaduto.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready')
    })

    // Errore esplicito nel fragment (es. #error=access_denied&error_code=otp_expired)
    if (window.location.hash.includes('error')) {
      setStatus('invalid')
    } else {
      supabase.auth.getSession().then(({ data }) => {
        setStatus((prev) => (prev === 'ready' ? prev : data.session ? 'ready' : 'invalid'))
      })
    }

    return () => sub.subscription.unsubscribe()
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ password }: FormData) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Password aggiornata 🐾')
    // La sessione di recovery è già valida: l'utente è autenticato, va in app.
    navigate('/app/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🐾</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">PetNote</h1>
          <p className="text-slate-600 text-sm mt-1">Imposta una nuova password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {status === 'checking' && (
            <p className="text-sm text-slate-600 text-center">Verifica del link in corso&hellip;</p>
          )}

          {status === 'invalid' && (
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-semibold text-slate-900">Link non valido o scaduto</h2>
              <p className="text-sm text-slate-600">
                Questo link di reset non è più valido. Richiedine uno nuovo.
              </p>
              <Link
                to="/password-dimenticata"
                className="inline-block text-sm text-brand-600 font-medium"
              >
                Richiedi un nuovo link
              </Link>
            </div>
          )}

          {status === 'ready' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Nuova password</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="Nuova password (min 6 caratteri)"
                    autoComplete="new-password"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <input
                    {...register('confirm')}
                    type="password"
                    placeholder="Conferma password"
                    autoComplete="new-password"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Salvataggio...' : 'Salva nuova password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
