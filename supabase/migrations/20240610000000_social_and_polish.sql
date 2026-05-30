-- Phase 5: Social Modules

-- News Table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'MANUAL' CHECK (type IN ('API', 'MANUAL')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tribunal Reports Table
CREATE TABLE IF NOT EXISTS public.tribunal_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
  target_id UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT NOT NULL,
  fine_amount BIGINT DEFAULT 200,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CULPABLE', 'INOCENTE', 'EXPIRED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours') NOT NULL
);

-- Tribunal Votes Table
CREATE TABLE IF NOT EXISTS public.tribunal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.tribunal_reports(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.profiles(id) NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('CULPABLE', 'INOCENTE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(report_id, voter_id)
);

-- Global Settings / Pot Table
CREATE TABLE IF NOT EXISTS public.global_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Initialize Group Pot
INSERT INTO public.global_settings (key, value) 
VALUES ('group_pot', '{"balance": 0}')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribunal_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribunal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "News is viewable by everyone" ON public.news FOR SELECT USING (true);
CREATE POLICY "Tribunal reports are viewable by everyone" ON public.tribunal_reports FOR SELECT USING (true);
CREATE POLICY "Tribunal votes are viewable by everyone" ON public.tribunal_votes FOR SELECT USING (true);
CREATE POLICY "Global settings are viewable by everyone" ON public.global_settings FOR SELECT USING (true);

-- Allow insertions (simplified for this exercise, usually we'd check auth)
CREATE POLICY "Anyone can insert tribunal reports" ON public.tribunal_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert tribunal votes" ON public.tribunal_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert news" ON public.news FOR INSERT WITH CHECK (true);
