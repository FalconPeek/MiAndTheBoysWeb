-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are readable by everyone
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Seed users
INSERT INTO public.profiles (full_name) VALUES
  ('Lucas Barbagallo'),
  ('Lucas Lindstrom'),
  ('Enoc Alegre'),
  ('Lucio Coutinho'),
  ('Ezequiel Oviedo'),
  ('Sebastian Vigliecca'),
  ('Maxi Dos Santos'),
  ('Agustin Bravo'),
  ('Matias Gamboa'),
  ('Chino'),
  ('Guido Pereyra')
ON CONFLICT (full_name) DO NOTHING;
