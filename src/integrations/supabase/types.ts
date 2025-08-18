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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      app_meta: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_participants: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          age_max: number | null
          age_min: number | null
          cost: number | null
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          is_active: boolean | null
          latitude: number | null
          location_address: string | null
          location_name: string | null
          longitude: number | null
          max_participants: number | null
          organizer_id: string | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          cost?: number | null
          created_at?: string
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_address?: string | null
          location_name?: string | null
          longitude?: number | null
          max_participants?: number | null
          organizer_id?: string | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          cost?: number | null
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          location_address?: string | null
          location_name?: string | null
          longitude?: number | null
          max_participants?: number | null
          organizer_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          is_mutual: boolean | null
          user1_id: string
          user1_swiped_at: string | null
          user1_swipes_since_match: number | null
          user2_id: string
          user2_swiped_at: string | null
          user2_swipes_since_match: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          user1_id: string
          user1_swiped_at?: string | null
          user1_swipes_since_match?: number | null
          user2_id: string
          user2_swiped_at?: string | null
          user2_swipes_since_match?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          user1_id?: string
          user1_swiped_at?: string | null
          user1_swipes_since_match?: number | null
          user2_id?: string
          user2_swiped_at?: string | null
          user2_swipes_since_match?: number | null
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          delivered_at: string | null
          id: string
          match_id: string
          message_type: string | null
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          match_id: string
          message_type?: string | null
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          match_id?: string
          message_type?: string | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_push_sent: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_push_sent?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_push_sent?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_verifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
          verification_data: Json | null
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          verification_data?: Json | null
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          verification_data?: Json | null
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          company: string | null
          created_at: string
          dating_intentions: string | null
          drinking: string | null
          education: string | null
          ethnicity: string | null
          exercise: string | null
          favorite_movies: string[] | null
          first_name: string | null
          gender: string | null
          has_kids: string | null
          height: number | null
          hobbies: string[] | null
          honesty_score: number | null
          id: string
          instagram_username: string | null
          interested_in: string | null
          interests: string[] | null
          is_demo_account: boolean | null
          is_online: boolean | null
          languages: string[] | null
          last_active: string | null
          last_name: string | null
          last_seen: string | null
          latitude: number | null
          location_city: string | null
          location_state: string | null
          longitude: number | null
          love_language: string | null
          music_genres: string[] | null
          occupation: string | null
          personality_type: string | null
          pets: string | null
          political_views: string | null
          preferred_age_max: number | null
          preferred_age_min: number | null
          preferred_distance: number | null
          preferred_gender: string | null
          profile_images: string[] | null
          prompt_answers: Json | null
          relationship_type: string | null
          religion: string | null
          smoking: string | null
          spotify_connected: boolean | null
          swipes_today: number | null
          total_swipes: number | null
          travel_style: string | null
          updated_at: string
          user_id: string
          wants_kids: string | null
          zodiac_sign: string | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          company?: string | null
          created_at?: string
          dating_intentions?: string | null
          drinking?: string | null
          education?: string | null
          ethnicity?: string | null
          exercise?: string | null
          favorite_movies?: string[] | null
          first_name?: string | null
          gender?: string | null
          has_kids?: string | null
          height?: number | null
          hobbies?: string[] | null
          honesty_score?: number | null
          id?: string
          instagram_username?: string | null
          interested_in?: string | null
          interests?: string[] | null
          is_demo_account?: boolean | null
          is_online?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          last_name?: string | null
          last_seen?: string | null
          latitude?: number | null
          location_city?: string | null
          location_state?: string | null
          longitude?: number | null
          love_language?: string | null
          music_genres?: string[] | null
          occupation?: string | null
          personality_type?: string | null
          pets?: string | null
          political_views?: string | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_distance?: number | null
          preferred_gender?: string | null
          profile_images?: string[] | null
          prompt_answers?: Json | null
          relationship_type?: string | null
          religion?: string | null
          smoking?: string | null
          spotify_connected?: boolean | null
          swipes_today?: number | null
          total_swipes?: number | null
          travel_style?: string | null
          updated_at?: string
          user_id: string
          wants_kids?: string | null
          zodiac_sign?: string | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          company?: string | null
          created_at?: string
          dating_intentions?: string | null
          drinking?: string | null
          education?: string | null
          ethnicity?: string | null
          exercise?: string | null
          favorite_movies?: string[] | null
          first_name?: string | null
          gender?: string | null
          has_kids?: string | null
          height?: number | null
          hobbies?: string[] | null
          honesty_score?: number | null
          id?: string
          instagram_username?: string | null
          interested_in?: string | null
          interests?: string[] | null
          is_demo_account?: boolean | null
          is_online?: boolean | null
          languages?: string[] | null
          last_active?: string | null
          last_name?: string | null
          last_seen?: string | null
          latitude?: number | null
          location_city?: string | null
          location_state?: string | null
          longitude?: number | null
          love_language?: string | null
          music_genres?: string[] | null
          occupation?: string | null
          personality_type?: string | null
          pets?: string | null
          political_views?: string | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_distance?: number | null
          preferred_gender?: string | null
          profile_images?: string[] | null
          prompt_answers?: Json | null
          relationship_type?: string | null
          religion?: string | null
          smoking?: string | null
          spotify_connected?: boolean | null
          swipes_today?: number | null
          total_swipes?: number | null
          travel_style?: string | null
          updated_at?: string
          user_id?: string
          wants_kids?: string | null
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          purchase_type: string
          status: string
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          purchase_type: string
          status?: string
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          purchase_type?: string
          status?: string
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      safety_reports: {
        Row: {
          created_at: string
          description: string | null
          evidence_urls: string[] | null
          id: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          report_type?: string
          reported_user_id?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          id: string
          is_like: boolean
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_like: boolean
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_like?: boolean
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: []
      }
      typing_indicators: {
        Row: {
          id: string
          is_typing: boolean
          match_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_typing?: boolean
          match_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_typing?: boolean
          match_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          created_at: string
          deal_breakers: string[] | null
          id: string
          must_haves: string[] | null
          preferred_education_levels: string[] | null
          preferred_ethnicities: string[] | null
          preferred_genders: string[] | null
          preferred_relationship_types: string[] | null
          preferred_religions: string[] | null
          search_radius: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string
          deal_breakers?: string[] | null
          id?: string
          must_haves?: string[] | null
          preferred_education_levels?: string[] | null
          preferred_ethnicities?: string[] | null
          preferred_genders?: string[] | null
          preferred_relationship_types?: string[] | null
          preferred_religions?: string[] | null
          search_radius?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string
          deal_breakers?: string[] | null
          id?: string
          must_haves?: string[] | null
          preferred_education_levels?: string[] | null
          preferred_ethnicities?: string[] | null
          preferred_genders?: string[] | null
          preferred_relationship_types?: string[] | null
          preferred_religions?: string[] | null
          search_radius?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_online_status: {
        Args: { online_status: boolean }
        Returns: undefined
      }
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
