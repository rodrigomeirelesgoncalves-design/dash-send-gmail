-- Add extended fields to email_responses for lead info
ALTER TABLE public.email_responses 
ADD COLUMN IF NOT EXISTS lead_name TEXT,
ADD COLUMN IF NOT EXISTS lead_company TEXT,
ADD COLUMN IF NOT EXISTS lead_website TEXT,
ADD COLUMN IF NOT EXISTS lead_city TEXT,
ADD COLUMN IF NOT EXISTS lead_tag TEXT,
ADD COLUMN IF NOT EXISTS gpt_response TEXT,
ADD COLUMN IF NOT EXISTS gpt_responded_at TIMESTAMP WITH TIME ZONE;

-- Create table for dossiê requests (leads with INTERESSE tag)
CREATE TABLE IF NOT EXISTS public.dossie_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  satellite_id UUID REFERENCES public.satellites(id) ON DELETE CASCADE,
  lead_email TEXT NOT NULL,
  lead_name TEXT,
  lead_company TEXT,
  lead_website TEXT,
  lead_city TEXT,
  response_id UUID REFERENCES public.email_responses(id),
  status TEXT NOT NULL DEFAULT 'PENDENTE',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.dossie_requests ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Allow all read access to dossie_requests" 
ON public.dossie_requests 
FOR SELECT USING (true);

CREATE POLICY "Allow all insert access to dossie_requests" 
ON public.dossie_requests 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update access to dossie_requests" 
ON public.dossie_requests 
FOR UPDATE USING (true);

CREATE POLICY "Allow all delete access to dossie_requests" 
ON public.dossie_requests 
FOR DELETE USING (true);

-- Add send scheduling table
CREATE TABLE IF NOT EXISTS public.scheduled_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  satellite_id UUID REFERENCES public.satellites(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  max_emails INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE,
  result JSONB
);

-- Enable RLS
ALTER TABLE public.scheduled_sends ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for scheduled_sends
CREATE POLICY "Allow all read access to scheduled_sends" 
ON public.scheduled_sends 
FOR SELECT USING (true);

CREATE POLICY "Allow all insert access to scheduled_sends" 
ON public.scheduled_sends 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update access to scheduled_sends" 
ON public.scheduled_sends 
FOR UPDATE USING (true);

CREATE POLICY "Allow all delete access to scheduled_sends" 
ON public.scheduled_sends 
FOR DELETE USING (true);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.dossie_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_sends;