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

-- Reconciliations table
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
  session_id UUID, -- For temporary tracking (cryptographically secure)
  expires_at TIMESTAMP WITH TIME ZONE, -- For auto-deletion of unassigned results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT exactly_one_identifier CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Partial index on session_id for unassigned results (performance optimization)
CREATE INDEX IF NOT EXISTS idx_reconciliations_session_id_unassigned ON public.reconciliations(session_id) WHERE user_id IS NULL;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for reconciliations
CREATE POLICY "Users can view own reconciliations" ON public.reconciliations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view own reconciliations by session_id" ON public.reconciliations
  FOR SELECT USING (
    auth.uid() IS NULL AND 
    session_id = current_setting('request.jwt.claim.session_id', true)::uuid
  );

CREATE POLICY "Users can insert own reconciliations" ON public.reconciliations
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND session_id = current_setting('request.jwt.claim.session_id', true)::uuid)
  );

CREATE POLICY "Users can update own reconciliations" ON public.reconciliations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reconciliations" ON public.reconciliations
  FOR DELETE USING (auth.uid() = user_id);

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

-- Function to assign unassigned results to user on authentication
CREATE OR REPLACE FUNCTION public.assign_results_to_user(user_uuid UUID, session_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Update unassigned reconciliations with matching session_id
  UPDATE public.reconciliations
  SET user_id = user_uuid,
      session_id = NULL,
      expires_at = NULL
  WHERE user_id IS NULL
    AND session_id = session_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired unassigned results
CREATE OR REPLACE FUNCTION public.cleanup_expired_results()
RETURNS VOID AS $$
BEGIN
  -- Delete expired reconciliations
  DELETE FROM public.reconciliations
  WHERE user_id IS NULL
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate reconciliation write compliance (strict discipline)
CREATE OR REPLACE FUNCTION public.validate_reconciliation_write()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure exactly one of user_id or session_id is present (enforced by CHECK constraint)
  -- If session_id is present, ensure expires_at is also present and within 15-30 minutes
  IF NEW.session_id IS NOT NULL THEN
    IF NEW.expires_at IS NULL THEN
      RAISE EXCEPTION 'session_id requires expires_at for temporary tracking';
    END IF;

    IF NEW.expires_at > NOW() + INTERVAL '30 minutes' THEN
      RAISE EXCEPTION 'expires_at must be within 30 minutes for temporary tracking';
    END IF;

    IF NEW.expires_at < NOW() + INTERVAL '15 minutes' THEN
      RAISE EXCEPTION 'expires_at must be at least 15 minutes from now';
    END IF;
  END IF;

  -- If user_id is present, ensure session_id and expires_at are NULL
  IF NEW.user_id IS NOT NULL THEN
    IF NEW.session_id IS NOT NULL OR NEW.expires_at IS NOT NULL THEN
      RAISE EXCEPTION 'user_id cannot coexist with session_id or expires_at';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to validate reconciliation writes
CREATE TRIGGER validate_reconciliation_before_write
  BEFORE INSERT OR UPDATE ON public.reconciliations
  FOR EACH ROW EXECUTE FUNCTION public.validate_reconciliation_write();
