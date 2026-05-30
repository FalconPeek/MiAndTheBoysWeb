-- Economy & Betting System

-- Add economy columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance BIGINT DEFAULT 1000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_debtor BOOLEAN DEFAULT false;

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount BIGINT NOT NULL,
  type TEXT NOT NULL, -- 'BET_PLACE', 'BET_WIN', 'SHOP_BUY', 'LOAN', 'INITIAL', 'ADMIN'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Betting Events table
CREATE TABLE IF NOT EXISTS public.betting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'SETTLED')),
  type TEXT DEFAULT 'SPORTS' CHECK (type IN ('SPORTS', 'SOCIAL')),
  options JSONB NOT NULL, -- e.g. {"1": "Argentina", "2": "Brazil"} or {"YES": "Yes", "NO": "No"}
  winning_outcome TEXT,
  total_pool BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bets table
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  event_id UUID REFERENCES public.betting_events(id) NOT NULL,
  outcome TEXT NOT NULL,
  amount BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, event_id)
);

-- Shop Items (optional table, but we can hardcode them in UI for now as per prompt)
-- If we wanted a table:
-- CREATE TABLE public.shop_items (id UUID PRIMARY KEY, name TEXT, price BIGINT, description TEXT);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betting_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Betting events are viewable by everyone" ON public.betting_events FOR SELECT USING (true);
CREATE POLICY "Users can view their own bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (assuming Lucas Barbagallo is admin)
-- We'll use a simple check for now or handle it in server actions.

-- Initialize balance for existing users who don't have transactions yet
-- (This is just in case, since we added a default to the column)
-- UPDATE public.profiles SET balance = 1000 WHERE balance IS NULL;
