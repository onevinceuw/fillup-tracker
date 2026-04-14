-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can insert own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete own vehicles" ON public.vehicles;

DROP POLICY IF EXISTS "Users can view own fillups" ON public.fillups;
DROP POLICY IF EXISTS "Users can insert own fillups" ON public.fillups;
DROP POLICY IF EXISTS "Users can update own fillups" ON public.fillups;
DROP POLICY IF EXISTS "Users can delete own fillups" ON public.fillups;

-- Create open policies
CREATE POLICY "Allow all on vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on fillups" ON public.fillups FOR ALL USING (true) WITH CHECK (true);

-- Make user_id nullable since we're not using auth
ALTER TABLE public.vehicles ALTER COLUMN user_id DROP NOT NULL;
