-- Add real-time location tracking table
CREATE TABLE IF NOT EXISTS public.driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(6, 2),
  speed DECIMAL(6, 2),
  heading DECIMAL(6, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add real-time tracking fields to packages
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_location TEXT,
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_locations
CREATE POLICY "Drivers can insert their own location" ON public.driver_locations
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can view their own location" ON public.driver_locations
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Admins can view all locations" ON public.driver_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('courier_admin', 'super_admin')
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to update package location
CREATE OR REPLACE FUNCTION public.update_package_location(
  p_package_id UUID,
  p_location TEXT,
  p_driver_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.packages 
  SET 
    current_location = p_location,
    last_location_update = NOW()
  WHERE id = p_package_id;
  
  -- Insert tracking entry
  INSERT INTO public.package_tracking (package_id, status, location, notes)
  VALUES (p_package_id, 'location_update', p_location, 'Location updated via GPS');
END;
$$;

-- Trigger function for package status notifications
CREATE OR REPLACE FUNCTION public.notify_package_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  package_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get package details
  SELECT * INTO package_record
  FROM public.packages
  WHERE id = NEW.package_id;
  
  -- Create notification title and message based on status
  CASE NEW.status
    WHEN 'picked_up' THEN
      notification_title := 'Package Picked Up';
      notification_message := 'Your package #' || package_record.tracking_number || ' has been picked up';
    WHEN 'in_transit' THEN
      notification_title := 'Package In Transit';
      notification_message := 'Your package #' || package_record.tracking_number || ' is now in transit';
    WHEN 'delivered' THEN
      notification_title := 'Package Delivered';
      notification_message := 'Your package #' || package_record.tracking_number || ' has been delivered';
    ELSE
      notification_title := 'Package Status Updated';
      notification_message := 'Your package #' || package_record.tracking_number || ' status: ' || NEW.status;
  END CASE;
  
  -- Create notification for package sender
  IF package_record.sender_id IS NOT NULL THEN
    PERFORM public.create_notification(
      package_record.sender_id,
      'package_update',
      notification_title,
      notification_message,
      jsonb_build_object('package_id', package_record.id, 'tracking_number', package_record.tracking_number)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for package status notifications
DROP TRIGGER IF EXISTS package_status_notification_trigger ON public.package_tracking;
CREATE TRIGGER package_status_notification_trigger
  AFTER INSERT ON public.package_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_package_status_change();
