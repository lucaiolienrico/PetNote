import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🐾</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">PetNote</h1>
          <p className="text-slate-600 text-sm mt-1">La salute del tuo animale, sempre con te</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
