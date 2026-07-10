import { Navigate } from 'react-router-dom'
import { RefreshCw, Users, PawPrint, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react'
import { useAuthStore, selectIsAdmin } from '@/stores/auth.store'
import { useAdminMetrics } from '@/lib/queries/adminMetrics'

const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const dateFmt = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })

function StatBox({ label, value, icon: Icon, accent }: {
  label: string
  value: string | number
  icon: typeof Users
  accent: string
}) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={accent} />
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    admin:   'bg-purple-500/20 text-purple-300 border-purple-500/30',
    premium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    free:    'bg-gray-500/20 text-gray-300 border-gray-500/30',
  }
  const label: Record<string, string> = { admin: 'Admin', premium: 'Premium', free: 'Free' }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[plan] ?? styles.free}`}>
      {label[plan] ?? plan}
    </span>
  )
}

export function AdminPage() {
  const isAdmin = useAuthStore(selectIsAdmin)

  // Hook chiamato sempre (rules-of-hooks) — disabilitato finché il gate non
  // è verificato, cosi' non parte mai una fetch per un non-admin anche solo
  // per una frazione di secondo prima del redirect.
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminMetrics(isAdmin)

  // Gate doppio: email + is_admin dal DB (client-side, prima linea di difesa;
  // la vera barriera è nell'Edge Function che rifiuta comunque chi non passa).
  if (!isAdmin) return <Navigate to="/app/dashboard" replace />

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔧 Admin Panel</h1>
            <p className="text-xs text-gray-500 mt-0.5">Metriche aggregate — solo lettura</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Aggiorna
          </button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300">Errore nel caricamento metriche</p>
              <p className="text-xs text-red-400/80 mt-1">
                {error instanceof Error ? error.message : 'Errore sconosciuto'}
              </p>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Utenti totali" value={data.totals.users} icon={Users} accent="text-blue-400" />
              <StatBox label="Pet totali" value={`${data.totals.pets} (${data.totals.activePets} attivi)`} icon={PawPrint} accent="text-green-400" />
              <StatBox label="Premium attivi" value={data.plan.premium} icon={CreditCard} accent="text-violet-400" />
              <StatBox
                label="MRR stimato"
                value={eur.format(data.subscriptions.mrrEstimate)}
                icon={TrendingUp}
                accent="text-amber-400"
              />
            </div>

            {data.subscriptions.unknownPlanCount > 0 && (
              <p className="text-[11px] text-gray-500 -mt-2">
                ⚠ {data.subscriptions.unknownPlanCount} subscription con piano non risolto da PayPal (esclus{data.subscriptions.unknownPlanCount === 1 ? 'a' : 'e'} dal MRR)
              </p>
            )}

            {/* ── PLAN BREAKDOWN ── */}
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <p className="text-xs font-semibold text-gray-400 mb-3">Distribuzione piani</p>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-300">Free: <b className="text-white">{data.plan.free}</b></span>
                <span className="text-gray-300">Premium: <b className="text-white">{data.plan.premium}</b></span>
                <span className="text-gray-300">Admin: <b className="text-white">{data.plan.admin}</b></span>
              </div>
              <div className="flex gap-4 text-sm mt-2 pt-2 border-t border-gray-700">
                <span className="text-gray-400">Cancellate: <b className="text-gray-300">{data.subscriptions.cancelled}</b></span>
                <span className="text-gray-400">Scadute: <b className="text-gray-300">{data.subscriptions.expired}</b></span>
              </div>
            </div>

            {/* ── RECENT USERS TABLE ── */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <p className="text-xs font-semibold text-gray-400 p-4 pb-2">Utenti recenti</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] text-gray-500 border-t border-gray-700">
                      <th className="px-4 py-2 font-medium">Email</th>
                      <th className="px-4 py-2 font-medium">Piano</th>
                      <th className="px-4 py-2 font-medium">Iscritto il</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentUsers.map(u => (
                      <tr key={u.id} className="border-t border-gray-700/50">
                        <td className="px-4 py-2.5 text-gray-200 truncate max-w-[200px]">{u.email}</td>
                        <td className="px-4 py-2.5"><PlanBadge plan={u.plan} /></td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">
                          {dateFmt.format(new Date(u.createdAt))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
