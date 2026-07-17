import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const schema = z.object({
  full_name: z.string().min(2, 'Nome troppo corto'),
  email:     z.string().email('Email non valida'),
  password:  z.string().min(6, 'Minimo 6 caratteri'),
})
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  useDocumentMeta({
    title: 'Registrati — PetNote',
    description: 'Crea il tuo account PetNote, gratis per un animale.',
    canonicalPath: '/register',
    noindex: true,
  })

  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password, full_name }: FormData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.session) {
        // Email confirmation OFF → sessione attiva subito
        toast.success('Benvenuto in PetNote! 🐾')
        navigate('/app/dashboard', { replace: true })
      } else {
        // Email confirmation ON → attende conferma
        toast.success('Controlla la tua email per confermare la registrazione!')
        navigate('/login', { replace: true })
      }
    } catch {
      toast.error('Errore di rete. Riprova.')
    }
  }

  const registerWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app/dashboard` },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Crea account</h2>

      <button
        onClick={registerWithGoogle}
        className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Registrati con Google
      </button>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <div className="flex-1 h-px bg-slate-100" />
        oppure
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            {...register('full_name')}
            placeholder="Nome e cognome"
            autoComplete="name"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>
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
        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Password (min 6 caratteri)"
            autoComplete="new-password"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Registrazione...' : 'Registrati gratis'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Registrandoti accetti i nostri{' '}
        <Link to="/termini" className="underline hover:text-slate-600">Termini di servizio</Link>
        {' '}e la nostra{' '}
        <Link to="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
      </p>

      <p className="text-center text-sm text-slate-600">
        Hai già un account?{' '}
        <Link to="/login" className="text-brand-600 font-medium">Accedi</Link>
      </p>
    </div>
  )
}
