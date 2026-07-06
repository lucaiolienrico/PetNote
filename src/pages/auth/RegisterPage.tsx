import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  full_name: z.string().min(2, 'Nome troppo corto'),
  email:     z.string().email('Email non valida'),
  password:  z.string().min(6, 'Minimo 6 caratteri'),
})
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password, full_name }: FormData) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })
    if (error) toast.error(error.message)
    else toast.success('Controlla la tua email per confermare la registrazione!')
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Crea account</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            {...register('full_name')}
            placeholder="Nome e cognome"
            autoComplete="name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Password (min 6 caratteri)"
            autoComplete="new-password"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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

      <p className="text-center text-xs text-gray-400">
        Registrandoti accetti i nostri Termini di servizio
      </p>

      <p className="text-center text-sm text-gray-500">
        Hai già un account?{' '}
        <Link to="/login" className="text-brand-600 font-medium">Accedi</Link>
      </p>
    </div>
  )
}
