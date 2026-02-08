-- Create olympiads table
CREATE TABLE public.olympiads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grades TEXT[] NOT NULL DEFAULT '{}',
  scale TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT NOT NULL,
  registration_deadline DATE NOT NULL,
  website TEXT,
  requirements TEXT[] DEFAULT '{}',
  organizer TEXT,
  format TEXT CHECK (format IN ('Онлайн', 'Очный', 'Смешанный')),
  prizes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.olympiads ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (everyone can view olympiads)
CREATE POLICY "Anyone can view olympiads" 
ON public.olympiads 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_olympiads_updated_at
BEFORE UPDATE ON public.olympiads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();