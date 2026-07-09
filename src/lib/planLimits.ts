// Limiti piano Free — unica fonte di verità, riusata da hook mutation e UI.
// Pro-only totale (0 per Free): vaccinations, antiparasitics, weight_logs,
// insurance_policies, medications, health_events, documents, share_links.
export const FREE_LIMITS = {
  pets:             1,
  vetVisitsPerPet:  1,
  allergiesPerPet:  1,
} as const

// Errore tipizzato lanciato dalle mutation quando un utente Free supera il
// limite. Distinto da PostgrestError così la UI può intercettarlo e reagire
// (es. aprire UpgradeModal) invece di mostrare un toast generico.
export class PlanLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PlanLimitError'
  }
}
