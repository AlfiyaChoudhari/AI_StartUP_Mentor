-- Setup PostgreSQL Schema for AI Startup Mentor

-- 1. Create a profiles table that automatically syncs with Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow individual write access to profiles" 
  ON public.profiles FOR ALL USING (auth.uid() = id);

-- Trigger to sync profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Founder'), new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Startup Ideas Table
CREATE TABLE IF NOT EXISTS public.startup_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  validation_score INTEGER,
  validation_report JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.startup_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own startup ideas"
  ON public.startup_ideas FOR ALL USING (auth.uid() = user_id);


-- 3. Competitor Reports Table
CREATE TABLE IF NOT EXISTS public.competitor_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  report_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.competitor_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage competitor reports of their own ideas"
  ON public.competitor_reports FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.startup_ideas
      WHERE public.startup_ideas.id = competitor_reports.startup_id
      AND public.startup_ideas.user_id = auth.uid()
    )
  );


-- 4. Business Plans Table
CREATE TABLE IF NOT EXISTS public.business_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  plan_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage business plans of their own ideas"
  ON public.business_plans FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.startup_ideas
      WHERE public.startup_ideas.id = business_plans.startup_id
      AND public.startup_ideas.user_id = auth.uid()
    )
  );


-- 5. Pitch Decks Table
CREATE TABLE IF NOT EXISTS public.pitch_decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  deck_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage pitch decks of their own ideas"
  ON public.pitch_decks FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.startup_ideas
      WHERE public.startup_ideas.id = pitch_decks.startup_id
      AND public.startup_ideas.user_id = auth.uid()
    )
  );


-- 6. Revenue Forecasts Table
CREATE TABLE IF NOT EXISTS public.revenue_forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE NOT NULL,
  forecast_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.revenue_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage revenue forecasts of their own ideas"
  ON public.revenue_forecasts FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.startup_ideas
      WHERE public.startup_ideas.id = revenue_forecasts.startup_id
      AND public.startup_ideas.user_id = auth.uid()
    )
  );


-- 7. Chat History Table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat history"
  ON public.chat_history FOR ALL USING (auth.uid() = user_id);
