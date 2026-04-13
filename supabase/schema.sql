-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase auth handles auth, this is for additional user data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Reconciliations table (created before files to avoid foreign key dependency)
CREATE TABLE IF NOT EXISTS public.reconciliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_bank INTEGER NOT NULL,
  total_provider INTEGER NOT NULL,
  matched INTEGER NOT NULL,
  unmatched INTEGER NOT NULL,
  discrepancies INTEGER NOT NULL,
  match_rate FLOAT NOT NULL,
  reconcilable_bank INTEGER NOT NULL,
  reconcilable_provider INTEGER NOT NULL,
  results JSONB NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT, -- For tracking unassigned reports
  expires_at TIMESTAMP WITH TIME ZONE, -- For auto-deletion of unassigned reports
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Files table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'provider')),
  content TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reconciliation_id UUID REFERENCES public.reconciliations(id) ON DELETE SET NULL,
  session_id TEXT, -- For tracking unassigned files
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for files
CREATE POLICY "Users can view own files" ON public.files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own files" ON public.files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON public.files
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reconciliations
CREATE POLICY "Users can view own reconciliations" ON public.reconciliations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reconciliations" ON public.reconciliations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own reconciliations" ON public.reconciliations
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to assign unassigned reports to user on authentication
CREATE OR REPLACE FUNCTION public.assign_reports_to_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Update unassigned reconciliations with matching session_id
  UPDATE public.reconciliations
  SET user_id = user_uuid,
      session_id = NULL,
      expires_at = NULL
  WHERE user_id IS NULL
    AND session_id IN (
      SELECT DISTINCT session_id
      FROM public.reconciliations
      WHERE user_id IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    );

  -- Update unassigned files with matching session_id
  UPDATE public.files
  SET user_id = user_uuid,
      session_id = NULL
  WHERE user_id IS NULL
    AND session_id IN (
      SELECT DISTINCT session_id
      FROM public.reconciliations
      WHERE user_id IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired unassigned reports
CREATE OR REPLACE FUNCTION public.cleanup_expired_reports()
RETURNS VOID AS $$
BEGIN
  -- Delete expired files
  DELETE FROM public.files
  WHERE user_id IS NULL
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  -- Delete expired reconciliations
  DELETE FROM public.reconciliations
  WHERE user_id IS NULL
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
