-- Pick'Em & World Cup Integration

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_flag TEXT,
  away_flag TEXT,
  group_name TEXT,
  stage TEXT NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'SCHEDULED',
  home_score INTEGER,
  away_score INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  match_id TEXT REFERENCES public.matches(id) NOT NULL,
  predicted_home INTEGER NOT NULL,
  predicted_away INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, match_id)
);

-- User Tournament Stats table
CREATE TABLE IF NOT EXISTS public.user_tournament_stats (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) NOT NULL,
  total_points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'Bronze',
  champion_prediction TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tournament_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Predictions are viewable by everyone" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own predictions" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own predictions" ON public.predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User stats are viewable by everyone" ON public.user_tournament_stats FOR SELECT USING (true);

-- Functions and Triggers for scoring could be added later, but for now we'll handle it in the application logic or manual updates as requested.
