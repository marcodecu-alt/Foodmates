export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_public?: boolean;
          created_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          group_id: string;
          added_by: string;
          place_id: string;
          name: string;
          address: string | null;
          lat: number | null;
          lng: number | null;
          cuisine: string | null;
          price_level: number | null;
          google_rating: number | null;
          photo_reference: string | null;
          website: string | null;
          phone: string | null;
          notes: string | null;
          status: string;
          visited_at: string | null;
          my_rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          added_by: string;
          place_id: string;
          name: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          cuisine?: string | null;
          price_level?: number | null;
          google_rating?: number | null;
          photo_reference?: string | null;
          website?: string | null;
          phone?: string | null;
          notes?: string | null;
          status?: string;
          visited_at?: string | null;
          my_rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          added_by?: string;
          place_id?: string;
          name?: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          cuisine?: string | null;
          price_level?: number | null;
          google_rating?: number | null;
          photo_reference?: string | null;
          website?: string | null;
          phone?: string | null;
          notes?: string | null;
          status?: string;
          visited_at?: string | null;
          my_rating?: number | null;
          created_at?: string;
        };
      };
      restaurant_member_status: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          status: string;
          visited_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          status: string;
          visited_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          user_id?: string;
          status?: string;
          visited_at?: string | null;
          created_at?: string;
        };
      };
      restaurant_media: {
        Row: {
          id: string;
          restaurant_id: string;
          uploaded_by: string;
          storage_path: string;
          type: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          uploaded_by: string;
          storage_path: string;
          type?: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          uploaded_by?: string;
          storage_path?: string;
          type?: string;
          caption?: string | null;
          created_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          group_id: string;
          added_by: string;
          title: string;
          description: string | null;
          source_url: string | null;
          ingredients: Json | null;
          steps: Json | null;
          prep_time: number | null;
          cook_time: number | null;
          servings: number | null;
          cuisine: string | null;
          tags: string[] | null;
          notes: string | null;
          status: string;
          cooked_at: string | null;
          my_rating: number | null;
          cover_photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          added_by: string;
          title: string;
          description?: string | null;
          source_url?: string | null;
          cover_photo_url?: string | null;
          ingredients?: Json | null;
          steps?: Json | null;
          prep_time?: number | null;
          cook_time?: number | null;
          servings?: number | null;
          cuisine?: string | null;
          tags?: string[] | null;
          notes?: string | null;
          status?: string;
          cooked_at?: string | null;
          my_rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          added_by?: string;
          title?: string;
          description?: string | null;
          source_url?: string | null;
          cover_photo_url?: string | null;
          ingredients?: Json | null;
          steps?: Json | null;
          prep_time?: number | null;
          cook_time?: number | null;
          servings?: number | null;
          cuisine?: string | null;
          tags?: string[] | null;
          notes?: string | null;
          status?: string;
          cooked_at?: string | null;
          my_rating?: number | null;
          created_at?: string;
        };
      };
      recipe_media: {
        Row: {
          id: string;
          recipe_id: string;
          uploaded_by: string;
          storage_path: string;
          type: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          uploaded_by: string;
          storage_path: string;
          type?: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          uploaded_by?: string;
          storage_path?: string;
          type?: string;
          caption?: string | null;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          entity_id: string;
          entity_type: string;
          user_id: string;
          rating: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_id: string;
          entity_type: string;
          user_id: string;
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_id?: string;
          entity_type?: string;
          user_id?: string;
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          group_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];
export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
export type RestaurantMedia = Database["public"]["Tables"]["restaurant_media"]["Row"];
export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
export type RecipeMedia = Database["public"]["Tables"]["recipe_media"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type DBReview = Database["public"]["Tables"]["reviews"]["Row"];
export type RestaurantMemberStatus = Database["public"]["Tables"]["restaurant_member_status"]["Row"];
