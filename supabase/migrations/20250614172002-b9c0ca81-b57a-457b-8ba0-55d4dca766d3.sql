
-- Add a status column to time_slots to track slot availability more effectively
ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS status text DEFAULT 'available';

-- Update existing slots to have the new status
UPDATE time_slots SET status = 'available' WHERE is_available = true;
UPDATE time_slots SET status = 'booked' WHERE is_available = false;

-- Add an index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_time_slots_status ON time_slots(status);
CREATE INDEX IF NOT EXISTS idx_appointments_mentor_startup ON appointments(mentor_id, startup_id);

-- Add a trigger to automatically update time slot status when appointments are created/updated
CREATE OR REPLACE FUNCTION update_time_slot_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If appointment is being created or updated to scheduled
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'scheduled' THEN
    UPDATE time_slots 
    SET status = 'booked', is_available = false 
    WHERE id = NEW.time_slot_id;
  END IF;
  
  -- If appointment is being cancelled or deleted
  IF (TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'completed')) OR TG_OP = 'DELETE' THEN
    UPDATE time_slots 
    SET status = 'available', is_available = true 
    WHERE id = COALESCE(NEW.time_slot_id, OLD.time_slot_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_time_slot_status ON appointments;
CREATE TRIGGER trigger_update_time_slot_status
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_time_slot_status();
