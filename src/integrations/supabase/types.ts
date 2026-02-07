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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dossie_requests: {
        Row: {
          completed_at: string | null
          id: string
          lead_city: string | null
          lead_company: string | null
          lead_email: string
          lead_name: string | null
          lead_website: string | null
          notes: string | null
          requested_at: string
          response_id: string | null
          satellite_id: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lead_city?: string | null
          lead_company?: string | null
          lead_email: string
          lead_name?: string | null
          lead_website?: string | null
          notes?: string | null
          requested_at?: string
          response_id?: string | null
          satellite_id?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          lead_city?: string | null
          lead_company?: string | null
          lead_email?: string
          lead_name?: string | null
          lead_website?: string | null
          notes?: string | null
          requested_at?: string
          response_id?: string | null
          satellite_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "dossie_requests_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "email_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dossie_requests_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
      }
      email_responses: {
        Row: {
          gpt_responded_at: string | null
          gpt_response: string | null
          id: string
          lead_city: string | null
          lead_company: string | null
          lead_name: string | null
          lead_tag: string | null
          lead_website: string | null
          received_at: string
          recipient_email: string
          response_content: string | null
          satellite_id: string
          sender_email: string
        }
        Insert: {
          gpt_responded_at?: string | null
          gpt_response?: string | null
          id?: string
          lead_city?: string | null
          lead_company?: string | null
          lead_name?: string | null
          lead_tag?: string | null
          lead_website?: string | null
          received_at?: string
          recipient_email: string
          response_content?: string | null
          satellite_id: string
          sender_email: string
        }
        Update: {
          gpt_responded_at?: string | null
          gpt_response?: string | null
          id?: string
          lead_city?: string | null
          lead_company?: string | null
          lead_name?: string | null
          lead_tag?: string | null
          lead_website?: string | null
          received_at?: string
          recipient_email?: string
          response_content?: string | null
          satellite_id?: string
          sender_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_responses_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
      }
      satellite_metrics: {
        Row: {
          bounced: number
          failed: number
          id: string
          opened: number
          opt_out: number
          recorded_at: string
          replied: number
          satellite_id: string
          sent: number
        }
        Insert: {
          bounced?: number
          failed?: number
          id?: string
          opened?: number
          opt_out?: number
          recorded_at?: string
          replied?: number
          satellite_id: string
          sent?: number
        }
        Update: {
          bounced?: number
          failed?: number
          id?: string
          opened?: number
          opt_out?: number
          recorded_at?: string
          replied?: number
          satellite_id?: string
          sent?: number
        }
        Relationships: [
          {
            foreignKeyName: "satellite_metrics_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
      }
      satellites: {
        Row: {
          alias: string
          created_at: string
          id: string
          is_active: boolean
          sheet_id: string
          updated_at: string
          web_url: string | null
        }
        Insert: {
          alias: string
          created_at?: string
          id?: string
          is_active?: boolean
          sheet_id: string
          updated_at?: string
          web_url?: string | null
        }
        Update: {
          alias?: string
          created_at?: string
          id?: string
          is_active?: boolean
          sheet_id?: string
          updated_at?: string
          web_url?: string | null
        }
        Relationships: []
      }
      scheduled_sends: {
        Row: {
          created_at: string
          executed_at: string | null
          id: string
          max_emails: number | null
          result: Json | null
          satellite_id: string | null
          scheduled_for: string
          status: string
        }
        Insert: {
          created_at?: string
          executed_at?: string | null
          id?: string
          max_emails?: number | null
          result?: Json | null
          satellite_id?: string | null
          scheduled_for: string
          status?: string
        }
        Update: {
          created_at?: string
          executed_at?: string | null
          id?: string
          max_emails?: number | null
          result?: Json | null
          satellite_id?: string | null
          scheduled_for?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_sends_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
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
