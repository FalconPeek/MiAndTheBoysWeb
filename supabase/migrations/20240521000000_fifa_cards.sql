-- Create attributes type
DO $$ BEGIN
    CREATE TYPE player_attribute AS ENUM (
        'Pace', 'Shot', 'Pass', 'Dribbling', 'Defense', 'Physical', 'GAY', 'PUTEADOR', 'TERMO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attribute player_attribute NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT no_self_voting CHECK (voter_id <> target_id),
    UNIQUE(voter_id, target_id, attribute)
);

-- Create calculated_stats table
CREATE TABLE IF NOT EXISTS public.calculated_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    attribute player_attribute NOT NULL,
    value INTEGER NOT NULL CHECK (value >= 50 AND value <= 99),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, attribute)
);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculated_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for votes
CREATE POLICY "Users can see all votes" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert votes" ON public.votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update votes" ON public.votes
    FOR UPDATE USING (true);

-- RLS Policies for calculated_stats
CREATE POLICY "Calculated stats are viewable by everyone" ON public.calculated_stats
    FOR SELECT USING (true);

-- Functions and Triggers for normalization could be here, 
-- but the requirement asks for a server action or utility.
-- However, I'll add a helper function for the normalization logic if needed.
