export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          meeting_url: string | null
          mentor_id: string | null
          notes: string | null
          scheduled_at: string
          startup_id: string | null
          status: string | null
          time_slot_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          mentor_id?: string | null
          notes?: string | null
          scheduled_at: string
          startup_id?: string | null
          status?: string | null
          time_slot_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          mentor_id?: string | null
          notes?: string | null
          scheduled_at?: string
          startup_id?: string | null
          status?: string | null
          time_slot_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_credentials: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          password: string
          role: Database["public"]["Enums"]["user_role"]
          startup_name: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          password: string
          role: Database["public"]["Enums"]["user_role"]
          startup_name?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          password?: string
          role?: Database["public"]["Enums"]["user_role"]
          startup_name?: string | null
          username?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          mentor_id: string | null
          startup_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentor_id?: string | null
          startup_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mentor_id?: string | null
          startup_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability_hours: Json | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          mentor_type: Database["public"]["Enums"]["mentor_type"]
          profile_id: string | null
          specializations: string[] | null
          years_experience: number | null
        }
        Insert: {
          availability_hours?: Json | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          mentor_type?: Database["public"]["Enums"]["mentor_type"]
          profile_id?: string | null
          specializations?: string[] | null
          years_experience?: number | null
        }
        Update: {
          availability_hours?: Json | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          mentor_type?: Database["public"]["Enums"]["mentor_type"]
          profile_id?: string | null
          specializations?: string[] | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          follow_up_date: string | null
          follow_up_time: string | null
          id: string
          message_type: string | null
          sender_profile_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          follow_up_date?: string | null
          follow_up_time?: string | null
          id?: string
          message_type?: string | null
          sender_profile_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          follow_up_date?: string | null
          follow_up_time?: string | null
          id?: string
          message_type?: string | null
          sender_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          company: string | null
          created_at: string | null
          expertise: string[] | null
          first_name: string | null
          id: string
          last_name: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          title: string | null
          updated_at: string | null
          user_id: string | null
          username: string
          verified_id: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          expertise?: string[] | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          profile_image_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          username: string
          verified_id?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          expertise?: string[] | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
          verified_id?: string | null
        }
        Relationships: []
      }
      scheduling_rules: {
        Row: {
          allow_recurring: boolean | null
          created_at: string | null
          default_duration_minutes: number | null
          id: string
          max_advance_booking_days: number | null
          max_sessions_per_week: number | null
          mentor_type: Database["public"]["Enums"]["mentor_type"]
          min_advance_booking_hours: number | null
        }
        Insert: {
          allow_recurring?: boolean | null
          created_at?: string | null
          default_duration_minutes?: number | null
          id?: string
          max_advance_booking_days?: number | null
          max_sessions_per_week?: number | null
          mentor_type: Database["public"]["Enums"]["mentor_type"]
          min_advance_booking_hours?: number | null
        }
        Update: {
          allow_recurring?: boolean | null
          created_at?: string | null
          default_duration_minutes?: number | null
          id?: string
          max_advance_booking_days?: number | null
          max_sessions_per_week?: number | null
          mentor_type?: Database["public"]["Enums"]["mentor_type"]
          min_advance_booking_hours?: number | null
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          appointment_id: string | null
          author_id: string | null
          content: string
          created_at: string | null
          follow_up_actions: Json | null
          follow_up_needed: boolean | null
          id: string
          is_shared: boolean | null
          shared_insights: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          author_id?: string | null
          content: string
          created_at?: string | null
          follow_up_actions?: Json | null
          follow_up_needed?: boolean | null
          id?: string
          is_shared?: boolean | null
          shared_insights?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          author_id?: string | null
          content?: string
          created_at?: string | null
          follow_up_actions?: Json | null
          follow_up_needed?: boolean | null
          id?: string
          is_shared?: boolean | null
          shared_insights?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          created_at: string | null
          description: string | null
          funding_amount: number | null
          id: string
          industry: string | null
          profile_id: string | null
          stage: string | null
          startup_name: string
          team_size: number | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          funding_amount?: number | null
          id?: string
          industry?: string | null
          profile_id?: string | null
          stage?: string | null
          startup_name: string
          team_size?: number | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          funding_amount?: number | null
          id?: string
          industry?: string | null
          profile_id?: string | null
          stage?: string | null
          startup_name?: string
          team_size?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startups_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          is_available: boolean | null
          is_recurring: boolean | null
          mentor_id: string | null
          recurrence_pattern: string | null
          start_time: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          mentor_id?: string | null
          recurrence_pattern?: string | null
          start_time: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          is_recurring?: boolean | null
          mentor_id?: string | null
          recurrence_pattern?: string | null
          start_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          added_at: string | null
          contacted_at: string | null
          id: string
          mentor_id: string | null
          notes: string | null
          priority: number | null
          startup_id: string | null
          status: string | null
        }
        Insert: {
          added_at?: string | null
          contacted_at?: string | null
          id?: string
          mentor_id?: string | null
          notes?: string | null
          priority?: number | null
          startup_id?: string | null
          status?: string | null
        }
        Update: {
          added_at?: string | null
          contacted_at?: string | null
          id?: string
          mentor_id?: string | null
          notes?: string | null
          priority?: number | null
          startup_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      mentor_type: "founder_mentor" | "expert" | "coach"
      user_role: "startup" | "mentor" | "team"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      mentor_type: ["founder_mentor", "expert", "coach"],
      user_role: ["startup", "mentor", "team"],
    },
  },
} as const
