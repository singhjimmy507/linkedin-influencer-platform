-- LinkedIn Influencer Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Users (extends Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  linkedin_url TEXT,
  linkedin_handle TEXT,
  brand_positioning TEXT,
  content_pillars JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice guides (system + custom)
CREATE TABLE IF NOT EXISTS voice_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  voice_type TEXT NOT NULL, -- 'system' or 'custom'
  description TEXT,
  voice_identity JSONB,
  core_rules JSONB,
  hook_formulas JSONB,
  closing_formulas JSONB,
  forbidden_phrases JSONB,
  formatting_rules JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post templates
CREATE TABLE IF NOT EXISTS post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  description TEXT,
  structure JSONB NOT NULL,
  example_posts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies researched
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

-- API data pulls (cached to avoid re-fetching)
CREATE TABLE IF NOT EXISTS company_data_pulls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  api_source TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  pull_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped LinkedIn profiles
CREATE TABLE IF NOT EXISTS scraped_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  linkedin_url TEXT NOT NULL,
  full_name TEXT,
  headline TEXT,
  scrape_status TEXT DEFAULT 'pending',
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped posts
CREATE TABLE IF NOT EXISTS scraped_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES scraped_profiles(id) ON DELETE CASCADE,
  linkedin_post_id TEXT,
  linkedin_url TEXT,
  content TEXT,
  posted_at TIMESTAMPTZ,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  reposts INT DEFAULT 0,
  has_images BOOLEAN DEFAULT false,
  num_images INT DEFAULT 0,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post analysis
CREATE TABLE IF NOT EXISTS post_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scraped_post_id UUID REFERENCES scraped_posts(id) ON DELETE CASCADE,
  hook TEXT,
  word_count INT,
  has_list_format BOOLEAN,
  topic_category TEXT,
  companies_mentioned TEXT[],
  cta TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content drafts
CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  voice_guide_id UUID REFERENCES voice_guides(id) ON DELETE SET NULL,
  template_id UUID REFERENCES post_templates(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagement targets
CREATE TABLE IF NOT EXISTS engagement_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  linkedin_url TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  tier INT NOT NULL, -- 1=daily, 2=3x/week, 3=weekly
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagement logs
CREATE TABLE IF NOT EXISTS engagement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID REFERENCES engagement_targets(id) ON DELETE SET NULL,
  engagement_type TEXT NOT NULL,
  post_url TEXT,
  comment_content TEXT,
  engaged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_data_pulls ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: users can only see/edit their own profile
CREATE POLICY "Users own their profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Voice guides: users see their own + system guides
CREATE POLICY "Users see own and system guides" ON voice_guides
  FOR SELECT USING (auth.uid() = user_id OR voice_type = 'system');

CREATE POLICY "Users manage own guides" ON voice_guides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own guides" ON voice_guides
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own guides" ON voice_guides
  FOR DELETE USING (auth.uid() = user_id);

-- Post templates: users see their own + system templates
CREATE POLICY "Users see own and system templates" ON post_templates
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users manage own templates" ON post_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own templates" ON post_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own templates" ON post_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Companies: users own their companies
CREATE POLICY "Users own their companies" ON companies
  FOR ALL USING (auth.uid() = user_id);

-- Company data pulls: users access through their companies
CREATE POLICY "Users access company data" ON company_data_pulls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = company_data_pulls.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Scraped profiles: users own their scraped profiles
CREATE POLICY "Users own scraped profiles" ON scraped_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Scraped posts: users access through their profiles
CREATE POLICY "Users access scraped posts" ON scraped_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM scraped_profiles
      WHERE scraped_profiles.id = scraped_posts.profile_id
      AND scraped_profiles.user_id = auth.uid()
    )
  );

-- Post analysis: users access through their posts
CREATE POLICY "Users access post analysis" ON post_analysis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM scraped_posts
      JOIN scraped_profiles ON scraped_profiles.id = scraped_posts.profile_id
      WHERE scraped_posts.id = post_analysis.scraped_post_id
      AND scraped_profiles.user_id = auth.uid()
    )
  );

-- Content drafts: users own their drafts
CREATE POLICY "Users own their drafts" ON content_drafts
  FOR ALL USING (auth.uid() = user_id);

-- Engagement targets: users own their targets
CREATE POLICY "Users own their targets" ON engagement_targets
  FOR ALL USING (auth.uid() = user_id);

-- Engagement logs: users own their logs
CREATE POLICY "Users own their logs" ON engagement_logs
  FOR ALL USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
