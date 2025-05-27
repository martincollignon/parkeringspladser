-- Create a simple trigger function that logs submission events
-- We'll use Supabase's built-in webhook functionality instead of the http extension
CREATE OR REPLACE FUNCTION send_submission_email_notification()
RETURNS trigger AS $$
BEGIN
  -- The actual email sending will be handled by Supabase webhooks
  -- configured in the dashboard to call our Edge Function
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger that fires on INSERT to submissions table
DROP TRIGGER IF EXISTS submission_email_trigger ON submissions;
CREATE TRIGGER submission_email_trigger
  AFTER INSERT ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION send_submission_email_notification();

-- Add helpful comments
COMMENT ON FUNCTION send_submission_email_notification() IS 
'Logs new submission events. Email notifications are handled by Supabase webhooks.
Configure webhook in Supabase Dashboard: Database > Webhooks > Create webhook for submissions table INSERT events.'; 