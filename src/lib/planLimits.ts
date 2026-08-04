// Limiti piano Free — unica fonte di verità, riusata da hook mutation e UI.
// Pro-only totale (0 per Free): antiparasitics, insurance_policies,
// medications, documents, share_links, reminders.
// Accesso libero su Free (nessun limite): weight_logs, health_events.
export const FREE_LIMITS = {
  pets:               1,
  vetVisitsPerPet:    2,
  allergiesPerPet:    1,
  vaccinationsPerPet: 2,
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
