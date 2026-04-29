export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type RoleKey =
  | 'platform_super_admin'
  | 'organization_owner'
  | 'gym_admin'
  | 'instructor'
  | 'front_desk'
  | 'student'
  | 'parent';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          platform_role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          platform_role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
        Relationships: [];
      };
      gyms: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          timezone: string;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          region: string | null;
          postal_code: string | null;
          phone: string | null;
          email: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          timezone?: string;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          region?: string | null;
          postal_code?: string | null;
          phone?: string | null;
          email?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['gyms']['Insert']>;
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          key: RoleKey;
          name: string;
          scope: 'platform' | 'organization' | 'gym' | 'portal';
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: RoleKey;
          name: string;
          scope: 'platform' | 'organization' | 'gym' | 'portal';
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['roles']['Insert']>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          role_id: string;
          status: string;
          created_at: string;
          updated_at: string;
          organizations?: Database['public']['Tables']['organizations']['Row'];
          roles?: Database['public']['Tables']['roles']['Row'];
        };
        Insert: {
          id?: string;
          organization_id: string;
          profile_id: string;
          role_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organization_members']['Insert']>;
        Relationships: [];
      };
      gym_members: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string;
          profile_id: string;
          role_id: string;
          status: string;
          created_at: string;
          updated_at: string;
          gyms?: Database['public']['Tables']['gyms']['Row'];
          roles?: Database['public']['Tables']['roles']['Row'];
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id: string;
          profile_id: string;
          role_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['gym_members']['Insert']>;
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string;
          family_id: string | null;
          first_name: string;
          last_name: string;
          preferred_name: string | null;
          email: string | null;
          phone: string | null;
          birthdate: string | null;
          status: Database['public']['Enums']['member_status'];
          joined_at: string | null;
          avatar_url: string | null;
          belt: string | null;
          stripes: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id: string;
          family_id?: string | null;
          first_name: string;
          last_name: string;
          preferred_name?: string | null;
          email?: string | null;
          phone?: string | null;
          birthdate?: string | null;
          status?: Database['public']['Enums']['member_status'];
          joined_at?: string | null;
          avatar_url?: string | null;
          belt?: string | null;
          stripes?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string | null;
          name: string;
          discipline: string;
          description: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id?: string | null;
          name: string;
          discipline?: string;
          description?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
        Relationships: [];
      };
      class_templates: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string;
          program_id: string | null;
          name: string;
          description: string | null;
          capacity: number | null;
          day_of_week: number | null;
          starts_at: string;
          ends_at: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id: string;
          program_id?: string | null;
          name: string;
          description?: string | null;
          capacity?: number | null;
          day_of_week?: number | null;
          starts_at: string;
          ends_at: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['class_templates']['Insert']>;
        Relationships: [];
      };
      attendance_records: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string;
          class_session_id: string;
          student_id: string;
          status: Database['public']['Enums']['attendance_status'];
          checked_in_at: string;
          checked_in_by_profile_id: string | null;
          kiosk_session_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id: string;
          class_session_id: string;
          student_id: string;
          status?: Database['public']['Enums']['attendance_status'];
          checked_in_at?: string;
          checked_in_by_profile_id?: string | null;
          kiosk_session_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['attendance_records']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      member_status: 'active' | 'inactive' | 'prospect' | 'suspended' | 'archived';
      billing_status: 'draft' | 'open' | 'paid' | 'past_due' | 'void' | 'refunded';
      payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
      booking_status: 'requested' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';
      attendance_status: 'present' | 'late' | 'excused' | 'absent';
    };
    CompositeTypes: Record<string, never>;
  };
};
