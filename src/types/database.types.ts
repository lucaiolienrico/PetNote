export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          id: number
          payload: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          id?: number
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          id?: number
          payload?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      allergies: {
        Row: {
          allergen: string
          created_at: string
          diagnosed_at: string | null
          id: string
          notes: string | null
          pet_id: string
          reaction: string | null
          severity: string
        }
        Insert: {
          allergen: string
          created_at?: string
          diagnosed_at?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          reaction?: string | null
          severity: string
        }
        Update: {
          allergen?: string
          created_at?: string
          diagnosed_at?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          reaction?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "allergies_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      antiparasitics: {
        Row: {
          administered_at: string
          created_at: string
          id: string
          next_due_at: string | null
          notes: string | null
          pet_id: string
          product_name: string
          type: string
        }
        Insert: {
          administered_at: string
          created_at?: string
          id?: string
          next_due_at?: string | null
          notes?: string | null
          pet_id: string
          product_name: string
          type: string
        }
        Update: {
          administered_at?: string
          created_at?: string
          id?: string
          next_due_at?: string | null
          notes?: string | null
          pet_id?: string
          product_name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "antiparasitics_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          pet_id: string
          title: string
          uploaded_at: string
        }
        Insert: {
          document_type: string
          file_size?: number | null
          file_url: string
          id?: string
          pet_id: string
          title: string
          uploaded_at?: string
        }
        Update: {
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          pet_id?: string
          title?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      health_events: {
        Row: {
          attachment_url: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          occurred_at: string
          pet_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          occurred_at: string
          pet_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          occurred_at?: string
          pet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_events_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_policies: {
        Row: {
          billing_frequency: string
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          pet_id: string
          policy_number: string | null
          premium_amount: number
          provider: string
          start_date: string
        }
        Insert: {
          billing_frequency: string
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          policy_number?: string | null
          premium_amount: number
          provider: string
          start_date: string
        }
        Update: {
          billing_frequency?: string
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          policy_number?: string | null
          premium_amount?: number
          provider?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_policies_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          drug_name: string
          end_date: string | null
          frequency: string | null
          id: string
          notes: string | null
          pet_id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          drug_name: string
          end_date?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          start_date: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          drug_name?: string
          end_date?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string
          id: string
          is_active: boolean
          microchip: string | null
          name: string
          notes: string | null
          owner_id: string
          photo_url: string | null
          sex: string
          species: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          microchip?: string | null
          name: string
          notes?: string | null
          owner_id: string
          photo_url?: string | null
          sex?: string
          species: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          microchip?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          photo_url?: string | null
          sex?: string
          species?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_paypal_events: {
        Row: {
          event_id: string
          event_type: string | null
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type?: string | null
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string | null
          processed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean
          onboarding_completed: boolean
          paypal_subscription_id: string | null
          plan: string
          subscription_expires_at: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          onboarding_completed?: boolean
          paypal_subscription_id?: string | null
          plan?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          onboarding_completed?: boolean
          paypal_subscription_id?: string | null
          plan?: string
          subscription_expires_at?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          keys_auth: string
          keys_p256dh: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          keys_auth: string
          keys_p256dh: string
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          keys_auth?: string
          keys_p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          due_date: string
          id: string
          notes: string | null
          pet_id: string
          title: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          pet_id: string
          title: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          pet_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      share_links: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          pet_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          pet_id: string
          token?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          pet_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_links_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccinations: {
        Row: {
          administered_at: string
          attachment_url: string | null
          batch_number: string | null
          created_at: string
          id: string
          next_due_at: string | null
          notes: string | null
          pet_id: string
          vaccine_name: string
          veterinarian: string | null
        }
        Insert: {
          administered_at: string
          attachment_url?: string | null
          batch_number?: string | null
          created_at?: string
          id?: string
          next_due_at?: string | null
          notes?: string | null
          pet_id: string
          vaccine_name: string
          veterinarian?: string | null
        }
        Update: {
          administered_at?: string
          attachment_url?: string | null
          batch_number?: string | null
          created_at?: string
          id?: string
          next_due_at?: string | null
          notes?: string | null
          pet_id?: string
          vaccine_name?: string
          veterinarian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      vet_visits: {
        Row: {
          attachment_url: string | null
          clinic: string | null
          cost: number | null
          created_at: string
          diagnosis: string | null
          id: string
          notes: string | null
          pet_id: string
          reason: string
          veterinarian: string | null
          visited_at: string
        }
        Insert: {
          attachment_url?: string | null
          clinic?: string | null
          cost?: number | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          reason: string
          veterinarian?: string | null
          visited_at: string
        }
        Update: {
          attachment_url?: string | null
          clinic?: string | null
          cost?: number | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          reason?: string
          veterinarian?: string | null
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vet_visits_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_logs: {
        Row: {
          created_at: string
          id: string
          measured_at: string
          notes: string | null
          pet_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          measured_at: string
          notes?: string | null
          pet_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          measured_at?: string
          notes?: string | null
          pet_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
