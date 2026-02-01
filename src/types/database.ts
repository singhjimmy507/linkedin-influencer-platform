export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          linkedin_url: string | null
          linkedin_handle: string | null
          brand_positioning: string | null
          content_pillars: Json
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          linkedin_url?: string | null
          linkedin_handle?: string | null
          brand_positioning?: string | null
          content_pillars?: Json
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          linkedin_url?: string | null
          linkedin_handle?: string | null
          brand_positioning?: string | null
          content_pillars?: Json
          created_at?: string
        }
      }
      voice_guides: {
        Row: {
          id: string
          user_id: string | null
          name: string
          voice_type: string
          description: string | null
          voice_identity: Json | null
          core_rules: Json | null
          hook_formulas: Json | null
          closing_formulas: Json | null
          forbidden_phrases: Json | null
          formatting_rules: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          voice_type: string
          description?: string | null
          voice_identity?: Json | null
          core_rules?: Json | null
          hook_formulas?: Json | null
          closing_formulas?: Json | null
          forbidden_phrases?: Json | null
          formatting_rules?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          voice_type?: string
          description?: string | null
          voice_identity?: Json | null
          core_rules?: Json | null
          hook_formulas?: Json | null
          closing_formulas?: Json | null
          forbidden_phrases?: Json | null
          formatting_rules?: Json | null
          is_active?: boolean
          created_at?: string
        }
      }
      post_templates: {
        Row: {
          id: string
          user_id: string | null
          name: string
          template_type: string
          description: string | null
          structure: Json
          example_posts: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          template_type: string
          description?: string | null
          structure: Json
          example_posts?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          template_type?: string
          description?: string | null
          structure?: Json
          example_posts?: Json | null
          created_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          user_id: string | null
          name: string
          domain: string
          industry: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          domain: string
          industry?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          domain?: string
          industry?: string | null
          created_at?: string
        }
      }
      company_data_pulls: {
        Row: {
          id: string
          company_id: string | null
          data_type: string
          api_source: string
          raw_data: Json
          pull_date: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          data_type: string
          api_source: string
          raw_data: Json
          pull_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          data_type?: string
          api_source?: string
          raw_data?: Json
          pull_date?: string
          created_at?: string
        }
      }
      scraped_profiles: {
        Row: {
          id: string
          user_id: string | null
          linkedin_url: string
          full_name: string | null
          headline: string | null
          scrape_status: string
          last_scraped_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          linkedin_url: string
          full_name?: string | null
          headline?: string | null
          scrape_status?: string
          last_scraped_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          linkedin_url?: string
          full_name?: string | null
          headline?: string | null
          scrape_status?: string
          last_scraped_at?: string | null
          created_at?: string
        }
      }
      scraped_posts: {
        Row: {
          id: string
          profile_id: string | null
          linkedin_post_id: string | null
          linkedin_url: string | null
          content: string | null
          posted_at: string | null
          likes: number
          comments: number
          reposts: number
          has_images: boolean
          num_images: number
          scraped_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          linkedin_post_id?: string | null
          linkedin_url?: string | null
          content?: string | null
          posted_at?: string | null
          likes?: number
          comments?: number
          reposts?: number
          has_images?: boolean
          num_images?: number
          scraped_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          linkedin_post_id?: string | null
          linkedin_url?: string | null
          content?: string | null
          posted_at?: string | null
          likes?: number
          comments?: number
          reposts?: number
          has_images?: boolean
          num_images?: number
          scraped_at?: string
        }
      }
      post_analysis: {
        Row: {
          id: string
          scraped_post_id: string | null
          hook: string | null
          word_count: number | null
          has_list_format: boolean | null
          topic_category: string | null
          companies_mentioned: string[] | null
          cta: string | null
          analyzed_at: string
        }
        Insert: {
          id?: string
          scraped_post_id?: string | null
          hook?: string | null
          word_count?: number | null
          has_list_format?: boolean | null
          topic_category?: string | null
          companies_mentioned?: string[] | null
          cta?: string | null
          analyzed_at?: string
        }
        Update: {
          id?: string
          scraped_post_id?: string | null
          hook?: string | null
          word_count?: number | null
          has_list_format?: boolean | null
          topic_category?: string | null
          companies_mentioned?: string[] | null
          cta?: string | null
          analyzed_at?: string
        }
      }
      content_drafts: {
        Row: {
          id: string
          user_id: string | null
          voice_guide_id: string | null
          template_id: string | null
          company_id: string | null
          title: string | null
          content: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          voice_guide_id?: string | null
          template_id?: string | null
          company_id?: string | null
          title?: string | null
          content: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          voice_guide_id?: string | null
          template_id?: string | null
          company_id?: string | null
          title?: string | null
          content?: string
          status?: string
          created_at?: string
        }
      }
      engagement_targets: {
        Row: {
          id: string
          user_id: string | null
          linkedin_url: string
          name: string
          title: string | null
          tier: number
          category: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          linkedin_url: string
          name: string
          title?: string | null
          tier: number
          category?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          linkedin_url?: string
          name?: string
          title?: string | null
          tier?: number
          category?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      engagement_logs: {
        Row: {
          id: string
          user_id: string | null
          target_id: string | null
          engagement_type: string
          post_url: string | null
          comment_content: string | null
          engaged_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          target_id?: string | null
          engagement_type: string
          post_url?: string | null
          comment_content?: string | null
          engaged_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          target_id?: string | null
          engagement_type?: string
          post_url?: string | null
          comment_content?: string | null
          engaged_at?: string
        }
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
  }
}
