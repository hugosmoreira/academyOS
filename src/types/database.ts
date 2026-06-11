export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PlatformRoleKey =
  | 'platform_super_admin'
  | 'platform_admin'
  | 'sales_admin'
  | 'support_admin';

export type OrganizationRoleKey =
  | 'organization_owner'
  | 'organization_admin'
  | 'organization_billing_manager';

export type GymRoleKey =
  | 'gym_owner'
  | 'gym_admin'
  | 'head_coach'
  | 'coach'
  | 'assistant_coach'
  | 'instructor'
  | 'front_desk'
  | 'billing_staff';

export type PortalRoleKey = 'student' | 'parent';

export type RoleKey = PlatformRoleKey | OrganizationRoleKey | GymRoleKey | PortalRoleKey;

export type SalesLeadStatus =
  | 'new'
  | 'contacted'
  | 'demo_scheduled'
  | 'converted'
  | 'lost';

export type ProfileStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export type ActiveStatus = 'active' | 'inactive';

export type ProgramAgeGroup = 'kids' | 'teens' | 'adults' | 'all';

export type ProgramTrainingType = 'gi' | 'nogi' | 'striking' | 'mma' | 'fitness' | 'private';

export type StudentPortalInviteStatus =
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'cancelled';

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
          status: ProfileStatus;
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
          status?: ProfileStatus;
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
          logo_url: string | null;
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
          logo_url?: string | null;
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
          portal_access_enabled: boolean;
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
          portal_access_enabled?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string | null;
          student_id: string | null;
          family_id: string | null;
          invoice_number: string;
          status: Database['public']['Enums']['billing_status'];
          subtotal_cents: number;
          discount_cents: number;
          tax_cents: number;
          total_cents: number;
          due_date: string | null;
          issued_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id?: string | null;
          student_id?: string | null;
          family_id?: string | null;
          invoice_number: string;
          status?: Database['public']['Enums']['billing_status'];
          subtotal_cents?: number;
          discount_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          due_date?: string | null;
          issued_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
        Relationships: [];
      };
      student_portal_invites: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string;
          student_id: string;
          email: string;
          invite_token: string;
          status: StudentPortalInviteStatus;
          expires_at: string;
          accepted_at: string | null;
          accepted_user_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id: string;
          student_id: string;
          email: string;
          invite_token?: string;
          status?: StudentPortalInviteStatus;
          expires_at?: string;
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['student_portal_invites']['Insert']>;
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string | null;
          name: string;
          description: string | null;
          age_group: ProgramAgeGroup | null;
          training_type: ProgramTrainingType | null;
          status: ActiveStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id?: string | null;
          name: string;
          description?: string | null;
          age_group?: ProgramAgeGroup | null;
          training_type?: ProgramTrainingType | null;
          status?: ActiveStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
        Relationships: [];
      };
      ranks: {
        Row: {
          id: string;
          organization_id: string | null;
          gym_id: string | null;
          program_id: string;
          name: string;
          color: string | null;
          order_index: number;
          minimum_classes: number | null;
          minimum_months: number | null;
          status: ActiveStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          gym_id?: string | null;
          program_id: string;
          name: string;
          color?: string | null;
          order_index?: number;
          minimum_classes?: number | null;
          minimum_months?: number | null;
          status?: ActiveStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ranks']['Insert']>;
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
          instructor_profile_id: string | null;
          capacity: number | null;
          day_of_week: number | null;
          start_time: string | null;
          end_time: string | null;
          status: ActiveStatus;
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
          instructor_profile_id?: string | null;
          capacity?: number | null;
          day_of_week?: number | null;
          start_time?: string | null;
          end_time?: string | null;
          status?: ActiveStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['class_templates']['Insert']>;
        Relationships: [];
      };
      student_program_enrollments: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string | null;
          student_id: string;
          program_id: string;
          rank_id: string | null;
          status: ActiveStatus;
          started_at: string;
          ended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id?: string | null;
          student_id: string;
          program_id: string;
          rank_id?: string | null;
          status?: ActiveStatus;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['student_program_enrollments']['Insert']>;
        Relationships: [];
      };
      student_class_enrollments: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string | null;
          student_id: string;
          class_template_id: string;
          status: ActiveStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id?: string | null;
          student_id: string;
          class_template_id: string;
          status?: ActiveStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['student_class_enrollments']['Insert']>;
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
      organization_invites: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string | null;
          email: string;
          full_name: string | null;
          role_key: RoleKey;
          token: string;
          status: 'pending' | 'accepted' | 'expired' | 'revoked';
          expires_at: string;
          created_by: string | null;
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id?: string | null;
          email: string;
          full_name?: string | null;
          role_key: RoleKey;
          token?: string;
          status?: 'pending' | 'accepted' | 'expired' | 'revoked';
          expires_at?: string;
          created_by?: string | null;
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['organization_invites']['Insert']>;
        Relationships: [];
      };
      student_user_links: {
        Row: {
          id: string;
          organization_id: string;
          gym_id: string | null;
          student_id: string;
          profile_id: string;
          status: 'active' | 'disabled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          gym_id?: string | null;
          student_id: string;
          profile_id: string;
          status?: 'active' | 'disabled';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['student_user_links']['Insert']>;
        Relationships: [];
      };
      parent_user_links: {
        Row: {
          id: string;
          organization_id: string;
          family_id: string;
          profile_id: string;
          status: 'active' | 'disabled';
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          family_id: string;
          profile_id: string;
          status?: 'active' | 'disabled';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['parent_user_links']['Insert']>;
        Relationships: [];
      };
      sales_leads: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          academy_name: string | null;
          message: string | null;
          status: SalesLeadStatus;
          source: string;
          assigned_to: string | null;
          converted_organization_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          academy_name?: string | null;
          message?: string | null;
          status?: SalesLeadStatus;
          source?: string;
          assigned_to?: string | null;
          converted_organization_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sales_leads']['Insert']>;
        Relationships: [];
      };
      platform_members: {
        Row: {
          id: string;
          profile_id: string;
          role_key: PlatformRoleKey;
          status: 'active' | 'inactive' | 'suspended';
          granted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          role_key: PlatformRoleKey;
          status?: 'active' | 'inactive' | 'suspended';
          granted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['platform_members']['Insert']>;
        Relationships: [];
      };
      parent_student_links: {
        Row: {
          id: string;
          organization_id: string;
          parent_profile_id: string;
          student_id: string;
          relationship: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          parent_profile_id: string;
          student_id: string;
          relationship?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['parent_student_links']['Insert']>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          gym_id: string | null;
          actor_profile_id: string | null;
          action: string;
          entity_table: string | null;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          gym_id?: string | null;
          actor_profile_id?: string | null;
          action: string;
          entity_table?: string | null;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_create_organization_bundle: {
        Args: {
          p_org_name: string;
          p_org_slug: string;
          p_gym_name: string;
          p_gym_slug: string;
          p_owner_email?: string | null;
          p_owner_full_name?: string | null;
          p_gym_timezone?: string | null;
        };
        Returns: {
          organization_id: string;
          gym_id: string;
          invite_id: string | null;
          invite_token: string | null;
        }[];
      };
      admin_create_gym_bundle: {
        Args: {
          p_gym_name: string;
          p_gym_slug: string;
          p_gym_timezone?: string | null;
          p_owner_email?: string | null;
          p_owner_full_name?: string | null;
          p_organization_id?: string | null;
          p_new_org_name?: string | null;
          p_new_org_slug?: string | null;
        };
        Returns: {
          organization_id: string;
          gym_id: string;
          invite_id: string | null;
          invite_token: string | null;
        }[];
      };
      accept_organization_invite: {
        Args: { p_token: string };
        Returns: {
          organization_id: string;
          gym_id: string | null;
          role_key: RoleKey;
        }[];
      };
      lookup_invite_by_token: {
        Args: { p_token: string };
        Returns: {
          organization_name: string;
          organization_slug: string;
          gym_name: string | null;
          email: string;
          full_name: string | null;
          role_key: RoleKey;
          status: 'pending' | 'accepted' | 'expired' | 'revoked';
          expires_at: string;
        }[];
      };
      get_platform_stats: {
        Args: Record<string, never>;
        Returns: {
          total_organizations: number;
          active_organizations: number;
          total_gyms: number;
          total_users: number;
          pending_invites: number;
          new_sales_leads: number;
          open_sales_leads: number;
        }[];
      };
      can_access_gym: {
        Args: { p_gym_id: string };
        Returns: boolean;
      };
      submit_sales_lead: {
        Args: {
          p_full_name: string;
          p_email: string;
          p_phone?: string | null;
          p_academy_name?: string | null;
          p_message?: string | null;
          p_source?: string | null;
        };
        Returns: string;
      };
      convert_sales_lead_to_organization: {
        Args: {
          p_lead_id: string;
          p_org_name: string;
          p_org_slug: string;
          p_gym_name: string;
          p_gym_slug: string;
          p_owner_email?: string | null;
          p_owner_full_name?: string | null;
          p_gym_timezone?: string | null;
        };
        Returns: {
          organization_id: string;
          gym_id: string;
          invite_id: string | null;
          invite_token: string | null;
        }[];
      };
      assign_org_member: {
        Args: {
          p_organization_id: string;
          p_profile_id: string;
          p_role_key: string;
          p_status?: string | null;
        };
        Returns: string;
      };
      assign_gym_member: {
        Args: {
          p_gym_id: string;
          p_profile_id: string;
          p_role_key: string;
          p_status?: string | null;
        };
        Returns: string;
      };
      set_platform_member: {
        Args: {
          p_profile_id: string;
          p_role_key: string;
          p_status?: string | null;
        };
        Returns: string;
      };
      has_platform_role: {
        Args: { p_role_key: string };
        Returns: boolean;
      };
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      can_manage_gym_students: {
        Args: { target_gym_id: string };
        Returns: boolean;
      };
      lookup_student_portal_invite_by_token: {
        Args: { p_token: string };
        Returns: {
          id: string;
          student_id: string;
          organization_id: string;
          gym_id: string;
          email: string;
          status: StudentPortalInviteStatus;
          expires_at: string;
          student_first_name: string;
          student_last_name: string;
          gym_name: string;
          organization_name: string;
        }[];
      };
      create_student_portal_invite: {
        Args: { p_student_id: string; p_email?: string | null };
        Returns: {
          id: string;
          invite_token: string;
          status: StudentPortalInviteStatus;
          expires_at: string;
        }[];
      };
      accept_student_portal_invite: {
        Args: { p_token: string };
        Returns: {
          organization_id: string;
          gym_id: string;
          student_id: string;
        }[];
      };
      cancel_student_portal_invite: {
        Args: { p_invite_id: string };
        Returns: null;
      };
      resend_student_portal_invite: {
        Args: { p_invite_id: string };
        Returns: {
          id: string;
          invite_token: string;
          status: StudentPortalInviteStatus;
          expires_at: string;
        }[];
      };
      disable_student_portal_access: {
        Args: { p_student_id: string };
        Returns: null;
      };
    };
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
