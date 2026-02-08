import { supabase } from '@/integrations/supabase/client';

export interface ParsedOlympiad {
  title: string;
  subject: string;
  grades: string[];
  scale: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  description: string;
  website: string | null;
  organizer: string | null;
  format: string | null;
}

export interface ParseResult {
  success: boolean;
  data?: {
    olympiads: ParsedOlympiad[];
    count: number;
    parsedAt: string;
    source: string;
  };
  error?: string;
}

export const olympiadParser = {
  async parse(): Promise<ParseResult> {
    const { data, error } = await supabase.functions.invoke('parse-olympiads');

    if (error) {
      console.error('Error calling parse-olympiads function:', error);
      return { success: false, error: error.message };
    }

    return data as ParseResult;
  },
};
