import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { MailCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const schema = z.object({
  email: z.string().email('Email non valida'),
})
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  useDocumentMeta({
    title: 'Recupera password — PetNote',
    description: 'Recupera l\u2019accesso al tuo account PetNote.',
    canonicalPath: '/password-dimenticata',
    noindex: true,
  })

  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: FormData) => {
    // redirectTo DEVE essere in Supabase Auth -> URL Configuration -> Redirect URLs,
    // altrimenti il link nell'email ricade sul Site URL e non raggiunge la pagina.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reimposta-password`,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    // Stato di conferma neutro: non rivela se l'email risulta o meno registrata
    // (evita user enumeration).
    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <MailCheck size={32} className="text-brand-600 mx-auto" />
        <h2 className="text-lg font-semibold text-slate-900">Controlla la tua email</h2>
        <p className="text-sm text-slate-600">
          Se l&rsquo;indirizzo è associato a un account, ti abbiamo inviato un link per
          reimpostare la password. Controlla anche la cartella spam.
        </p>
        <Link to="/login" className="inline-block text-sm text-brand-600 font-medium">
          Torna all&rsquo;accesso
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Password dimenticata?</h2>
        <p className="text-sm text-slate-600 mt-1">
          Inserisci la tua email: ti invieremo un link per reimpostarla.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Invio...' : 'Invia link di reset'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Ti sei ricordato?{' '}
        <Link to="/login" className="text-brand-600 font-medium">Accedi</Link>
      </p>
    </div>
  )
}
