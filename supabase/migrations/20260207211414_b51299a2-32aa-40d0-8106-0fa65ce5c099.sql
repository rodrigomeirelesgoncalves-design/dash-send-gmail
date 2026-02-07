-- Create table for storing satellites with their sheet configurations
CREATE TABLE public.satellites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    alias TEXT NOT NULL,
    sheet_id TEXT NOT NULL,
    web_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing metrics history
CREATE TABLE public.satellite_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    satellite_id UUID REFERENCES public.satellites(id) ON DELETE CASCADE NOT NULL,
    sent INTEGER NOT NULL DEFAULT 0,
    opened INTEGER NOT NULL DEFAULT 0,
    replied INTEGER NOT NULL DEFAULT 0,
    bounced INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    opt_out INTEGER NOT NULL DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for email responses
CREATE TABLE public.email_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    satellite_id UUID REFERENCES public.satellites(id) ON DELETE CASCADE NOT NULL,
    sender_email TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    response_content TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.satellites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for now)
CREATE POLICY "Allow all access to satellites" ON public.satellites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to satellite_metrics" ON public.satellite_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to email_responses" ON public.email_responses FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_satellites_updated_at
    BEFORE UPDATE ON public.satellites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for metrics
ALTER PUBLICATION supabase_realtime ADD TABLE public.satellite_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_responses;