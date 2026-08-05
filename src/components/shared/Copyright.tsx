interface CopyrightProps {
  /** 'short': riga singola per footer/sidebar. 'extended': aggiunge il riferimento
   *  normativo, da usare in un solo punto (Impostazioni) per non essere ridondanti. */
  variant?: 'short' | 'extended'
  className?: string
}

// Anno calcolato nel render, non a module-load: evita di restare stale se la
// sessione resta aperta a cavallo di capodanno.
export function Copyright({ variant = 'short', className = '' }: CopyrightProps) {
  const year = new Date().getFullYear()

  if (variant === 'extended') {
    return (
      <div className={`text-center text-slate-400 ${className}`}>
        <p className="text-xs">© {year} PetNote di Enrico Lucaioli</p>
        <p className="text-[11px] mt-0.5">Tutti i diritti riservati · L. 633/1941</p>
      </div>
    )
  }

  return (
    <p className={`text-xs text-slate-400 ${className}`}>
      © {year} PetNote · Tutti i diritti riservati
    </p>
  )
}
