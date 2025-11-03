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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bakeries: {
        Row: {
          active_subscriptions: number | null
          created_at: string | null
          delivery_vehicle: string | null
          distance: number | null
          dono_id: string | null
          endereco: string | null
          id: string
          latitude: number
          logo_url: string | null
          longitude: number | null
          nome: string | null
          rating: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          active_subscriptions?: number | null
          created_at?: string | null
          delivery_vehicle?: string | null
          distance?: number | null
          dono_id?: string | null
          endereco?: string | null
          id?: string
          latitude: number
          logo_url?: string | null
          longitude?: number | null
          nome?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          active_subscriptions?: number | null
          created_at?: string | null
          delivery_vehicle?: string | null
          distance?: number | null
          dono_id?: string | null
          endereco?: string | null
          id?: string
          latitude?: number
          logo_url?: string | null
          longitude?: number | null
          nome?: string | null
          rating?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          address: string
          created_at: string | null
          customer_feedback: string | null
          customer_name: string
          delivery_date: string | null
          delivery_person_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          rating: number | null
          status: string | null
          subscription_id: string
          time_slot: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          customer_feedback?: string | null
          customer_name: string
          delivery_date?: string | null
          delivery_person_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          status?: string | null
          subscription_id: string
          time_slot?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          customer_feedback?: string | null
          customer_name?: string
          delivery_date?: string | null
          delivery_person_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          status?: string | null
          subscription_id?: string
          time_slot?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feed_posts: {
        Row: {
          bakery_id: string
          caption: string
          created_at: string | null
          id: string
          image_url: string | null
          rating: number | null
          user_id: string
          user_name: string
          user_profile_image: string | null
        }
        Insert: {
          bakery_id: string
          caption: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          rating?: number | null
          user_id: string
          user_name: string
          user_profile_image?: string | null
        }
        Update: {
          bakery_id?: string
          caption?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          rating?: number | null
          user_id?: string
          user_name?: string
          user_profile_image?: string | null
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          bakery_name: string | null
          clicks: number | null
          created_at: string | null
          end_date: string | null
          id: string
          product_id: string
          product_name: string | null
          start_date: string | null
          status: string | null
          views: number | null
        }
        Insert: {
          bakery_name?: string | null
          clicks?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          product_id: string
          product_name?: string | null
          start_date?: string | null
          status?: string | null
          views?: number | null
        }
        Update: {
          bakery_name?: string | null
          clicks?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          product_id?: string
          product_name?: string | null
          start_date?: string | null
          status?: string | null
          views?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          cliente_id: string | null
          criado_em: string | null
          id: string
          padaria_id: string | null
          produto_id: string | null
          quantidade: number | null
          status: string | null
          valor_total: number | null
        }
        Insert: {
          cliente_id?: string | null
          criado_em?: string | null
          id?: string
          padaria_id?: string | null
          produto_id?: string | null
          quantidade?: number | null
          status?: string | null
          valor_total?: number | null
        }
        Update: {
          cliente_id?: string | null
          criado_em?: string | null
          id?: string
          padaria_id?: string | null
          produto_id?: string | null
          quantidade?: number | null
          status?: string | null
          valor_total?: number | null
        }
        Relationships: []
      }
      padoka_plans: {
        Row: {
          created_at: string | null
          id: number
          monthly_limit: number
          plan_type: string
          price: number
          price_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          monthly_limit: number
          plan_type: string
          price: number
          price_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          monthly_limit?: number
          plan_type?: string
          price?: number
          price_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      padoka_subscriptions: {
        Row: {
          created_at: string | null
          id: number
          price_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          price_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          price_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "padoka_subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "padoka_plans"
            referencedColumns: ["price_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          client_name: string | null
          created_at: string | null
          data_pagamento: string | null
          id: string | null
          method: string | null
          metodo: string | null
          pedido_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          amount?: number | null
          client_name?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          id?: string | null
          method?: string | null
          metodo?: string | null
          pedido_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          amount?: number | null
          client_name?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          id?: string | null
          method?: string | null
          metodo?: string | null
          pedido_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          nome: string | null
          padaria_id: string | null
          popularity: string | null
          preco: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string | null
          padaria_id?: string | null
          popularity?: string | null
          preco?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string | null
          padaria_id?: string | null
          popularity?: string | null
          preco?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number | null
          subscription_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number | null
          subscription_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number | null
          subscription_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          bakery_name: string | null
          cliente_id: string | null
          created_at: string | null
          dias_entrega: number | null
          id: string
          next_delivery: string | null
          padaria_id: string | null
          plan: string | null
          preco_total: number | null
          status: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          bakery_name?: string | null
          cliente_id?: string | null
          created_at?: string | null
          dias_entrega?: number | null
          id?: string
          next_delivery?: string | null
          padaria_id?: string | null
          plan?: string | null
          preco_total?: number | null
          status?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          bakery_name?: string | null
          cliente_id?: string | null
          created_at?: string | null
          dias_entrega?: number | null
          id?: string
          next_delivery?: string | null
          padaria_id?: string | null
          plan?: string | null
          preco_total?: number | null
          status?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user: {
        Row: {
          criado_em: string | null
          email: string | null
          id: string
          nome: string | null
          telefone: string | null
          tipo: string | null
        }
        Insert: {
          criado_em?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
          tipo?: string | null
        }
        Update: {
          criado_em?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          description: string | null
          icon: string
          id: string
          title: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          description?: string | null
          icon: string
          id?: string
          title: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          description?: string | null
          icon?: string
          id?: string
          title?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          created_at: string | null
          delivery_stats_average_rating: number | null
          delivery_stats_deliveries_month: number | null
          delivery_stats_level: string | null
          delivery_stats_on_time_rate: number | null
          email: string
          gamification_level: string | null
          gamification_next_level_points: number | null
          gamification_points: number | null
          id: string
          name: string
          password: string | null
          phone: string | null
          profile_image_url: string | null
          role: string
          status: string | null
          updated_at: string | null
          vehicle: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          delivery_stats_average_rating?: number | null
          delivery_stats_deliveries_month?: number | null
          delivery_stats_level?: string | null
          delivery_stats_on_time_rate?: number | null
          email: string
          gamification_level?: string | null
          gamification_next_level_points?: number | null
          gamification_points?: number | null
          id?: string
          name: string
          password?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
          vehicle?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          delivery_stats_average_rating?: number | null
          delivery_stats_deliveries_month?: number | null
          delivery_stats_level?: string | null
          delivery_stats_on_time_rate?: number | null
          email?: string
          gamification_level?: string | null
          gamification_next_level_points?: number | null
          gamification_points?: number | null
          id?: string
          name?: string
          password?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
          vehicle?: string | null
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          address: string | null
          created_at: string | null
          delivery_avg_rating: number | null
          delivery_month_count: number | null
          delivery_ontime_rate: number | null
          full_name: string
          gamification_level: string | null
          gamification_points: number | null
          id: string
          phone: string | null
          profile_image_url: string | null
          role: string
          status: string | null
          updated_at: string | null
          vehicle: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          delivery_avg_rating?: number | null
          delivery_month_count?: number | null
          delivery_ontime_rate?: number | null
          full_name: string
          gamification_level?: string | null
          gamification_points?: number | null
          id: string
          phone?: string | null
          profile_image_url?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
          vehicle?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          delivery_avg_rating?: number | null
          delivery_month_count?: number | null
          delivery_ontime_rate?: number | null
          full_name?: string
          gamification_level?: string | null
          gamification_points?: number | null
          id?: string
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
          vehicle?: string | null
        }
        Relationships: []
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
