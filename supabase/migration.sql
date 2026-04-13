-- Migration script to add session_id and expires_at columns to existing reconciliations table

-- Add session_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reconciliations' 
    AND column_name = 'session_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.reconciliations ADD COLUMN session_id UUID;
  END IF;
END $$;

-- Add expires_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reconciliations' 
    AND column_name = 'expires_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.reconciliations ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Drop old index if exists
DROP INDEX IF EXISTS public.idx_reconciliations_session_id;

-- Create partial index on session_id for unassigned results
CREATE INDEX IF NOT EXISTS idx_reconciliations_session_id_unassigned ON public.reconciliations(session_id) WHERE user_id IS NULL;

-- Add CHECK constraint for exactly one identifier
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'exactly_one_identifier' 
    AND conrelid = 'public.reconciliations'::regclass
  ) THEN
    ALTER TABLE public.reconciliations 
    ADD CONSTRAINT exactly_one_identifier CHECK (
      (user_id IS NOT NULL AND session_id IS NULL) OR
      (user_id IS NULL AND session_id IS NOT NULL)
    );
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own reconciliations" ON public.reconciliations;
DROP POLICY IF EXISTS "Anonymous users can view own reconciliations by session_id" ON public.reconciliations;
DROP POLICY IF EXISTS "Users can insert own reconciliations" ON public.reconciliations;
DROP POLICY IF EXISTS "Users can update own reconciliations" ON public.reconciliations;
DROP POLICY IF EXISTS "Users can delete own reconciliations" ON public.reconciliations;

-- Create new RLS policies
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

-- Drop old functions
DROP FUNCTION IF EXISTS public.assign_results_to_user CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_expired_results CASCADE;
DROP FUNCTION IF EXISTS public.validate_reconciliation_write CASCADE;

-- Drop old triggers
DROP TRIGGER IF EXISTS validate_reconciliation_before_write ON public.reconciliations;

-- Create functions
CREATE OR REPLACE FUNCTION public.assign_results_to_user(user_uuid UUID, session_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.reconciliations
  SET user_id = user_uuid,
      session_id = NULL,
      expires_at = NULL
  WHERE user_id IS NULL
    AND session_id = session_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.cleanup_expired_results()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.reconciliations
  WHERE user_id IS NULL
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.validate_reconciliation_write()
RETURNS TRIGGER AS $$
BEGIN
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

  IF NEW.user_id IS NOT NULL THEN
    IF NEW.session_id IS NOT NULL OR NEW.expires_at IS NOT NULL THEN
      RAISE EXCEPTION 'user_id cannot coexist with session_id or expires_at';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER validate_reconciliation_before_write
  BEFORE INSERT OR UPDATE ON public.reconciliations
  FOR EACH ROW EXECUTE FUNCTION public.validate_reconciliation_write();
