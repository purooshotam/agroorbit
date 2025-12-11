-- Add DELETE policy for profiles table
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Add UPDATE policy for ndvi_readings table
CREATE POLICY "Users can update readings for their farms"
ON public.ndvi_readings
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM farms WHERE farms.id = ndvi_readings.farm_id AND farms.user_id = auth.uid())
);

-- Add DELETE policy for ndvi_readings table
CREATE POLICY "Users can delete readings for their farms"
ON public.ndvi_readings
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM farms WHERE farms.id = ndvi_readings.farm_id AND farms.user_id = auth.uid())
);