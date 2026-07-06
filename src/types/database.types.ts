// Auto-generated via: supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.types.ts
// Per ora placeholder — sostituire dopo aver creato lo schema su Supabase

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:                      string
          full_name:               string | null
          avatar_url:              string | null
          plan:                    'free' | 'premium'
          paypal_subscription_id:  string | null
          subscription_status:     'active' | 'cancelled' | 'expired' | null
          subscription_expires_at: string | null
          is_admin:                boolean
          created_at:              string
          updated_at:              string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      pets: {
        Row: {
          id:         string
          owner_id:   string
          name:       string
          species:    'cane' | 'gatto' | 'coniglio' | 'uccello' | 'rettile' | 'altro'
          breed:      string | null
          sex:        'maschio' | 'femmina' | 'non_specificato'
          birth_date: string | null
          microchip:  string | null
          photo_url:  string | null
          notes:      string | null
          is_active:  boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pets']['Insert']>
      }
      vaccinations: {
        Row: {
          id:              string
          pet_id:          string
          vaccine_name:    string
          administered_at: string
          veterinarian:    string | null
          batch_number:    string | null
          next_due_at:     string | null
          notes:           string | null
          attachment_url:  string | null
          created_at:      string
        }
        Insert: Omit<Database['public']['Tables']['vaccinations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vaccinations']['Insert']>
      }
      vet_visits: {
        Row: {
          id:             string
          pet_id:         string
          visited_at:     string
          clinic:         string | null
          veterinarian:   string | null
          reason:         string
          diagnosis:      string | null
          cost:           number | null
          notes:          string | null
          attachment_url: string | null
          created_at:     string
        }
        Insert: Omit<Database['public']['Tables']['vet_visits']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vet_visits']['Insert']>
      }
      antiparasitics: {
        Row: {
          id:              string
          pet_id:          string
          product_name:    string
          type:            'interno' | 'esterno' | 'entrambi'
          administered_at: string
          next_due_at:     string | null
          notes:           string | null
          created_at:      string
        }
        Insert: Omit<Database['public']['Tables']['antiparasitics']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['antiparasitics']['Insert']>
      }
      weight_logs: {
        Row: {
          id:          string
          pet_id:      string
          weight_kg:   number
          measured_at: string
          notes:       string | null
          created_at:  string
        }
        Insert: Omit<Database['public']['Tables']['weight_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['weight_logs']['Insert']>
      }
      health_events: {
        Row: {
          id:             string
          pet_id:         string
          event_type:     string
          occurred_at:    string
          description:    string | null
          attachment_url: string | null
          created_at:     string
        }
        Insert: Omit<Database['public']['Tables']['health_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['health_events']['Insert']>
      }
      medications: {
        Row: {
          id:         string
          pet_id:     string
          drug_name:  string
          dosage:     string | null
          frequency:  string | null
          start_date: string
          end_date:   string | null
          notes:      string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['medications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['medications']['Insert']>
      }
      documents: {
        Row: {
          id:            string
          pet_id:        string
          title:         string
          document_type: 'passaporto' | 'cartella_clinica' | 'ricetta' | 'esame' | 'altro'
          file_url:      string
          file_size:     number | null
          uploaded_at:   string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'uploaded_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      share_links: {
        Row: {
          id:         string
          pet_id:     string
          token:      string
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['share_links']['Row'], 'id' | 'token' | 'created_at'>
        Update: Partial<Database['public']['Tables']['share_links']['Insert']>
      }
    }
    Views:   Record<string, never>
    Functions: Record<string, never>
    Enums:   Record<string, never>
  }
}
