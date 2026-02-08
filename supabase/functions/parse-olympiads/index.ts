const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ParsedOlympiad {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting olympiad parsing from olimpiada.ru');

    // Scrape the main olympiad calendar page
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://olimpiada.ru/activities',
        formats: ['markdown', 'extract'],
        extract: {
          prompt: `Extract all olympiads from this page. For each olympiad extract:
            - title: the name of the olympiad
            - subject: the subject (Математика, Физика, Информатика, Химия, Биология, Русский язык, Литература, История, Обществознание, География, Английский язык, or other)
            - grades: array of grades (like ["9", "10", "11"] or ["5", "6", "7", "8", "9", "10", "11"])
            - scale: the scale (Всероссийская, Региональная, or Международная)
            - startDate: start date in YYYY-MM-DD format
            - endDate: end date in YYYY-MM-DD format
            - registrationDeadline: registration deadline in YYYY-MM-DD format (use startDate if not specified)
            - description: brief description of the olympiad
            - website: official website URL if available
            - organizer: organizing institution if mentioned
            - format: format of the olympiad (Очная, Заочная, Онлайн, or Смешанная)
            
            Return an array of olympiad objects. If dates are not clear, use reasonable defaults based on typical olympiad schedules.`,
          schema: {
            type: 'object',
            properties: {
              olympiads: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    subject: { type: 'string' },
                    grades: { type: 'array', items: { type: 'string' } },
                    scale: { type: 'string' },
                    startDate: { type: 'string' },
                    endDate: { type: 'string' },
                    registrationDeadline: { type: 'string' },
                    description: { type: 'string' },
                    website: { type: 'string' },
                    organizer: { type: 'string' },
                    format: { type: 'string' }
                  },
                  required: ['title', 'subject', 'grades', 'scale', 'startDate', 'endDate', 'registrationDeadline', 'description']
                }
              }
            },
            required: ['olympiads']
          }
        },
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('Firecrawl API error:', scrapeData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: scrapeData.error || `Request failed with status ${scrapeResponse.status}` 
        }),
        { status: scrapeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract olympiads from response - check both extract and json fields
    const extractData = scrapeData.data?.extract || scrapeData.extract;
    const olympiads: ParsedOlympiad[] = extractData?.olympiads || [];

    console.log(`Successfully parsed ${olympiads.length} olympiads`);

    // Validate and clean up the data
    const validOlympiads = olympiads.filter((o: ParsedOlympiad) => {
      return o.title && o.subject && o.grades?.length > 0 && o.startDate && o.endDate;
    }).map((o: ParsedOlympiad) => ({
      ...o,
      grades: o.grades.map(g => String(g)),
      website: o.website || null,
      organizer: o.organizer || null,
      format: o.format || null,
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          olympiads: validOlympiads,
          count: validOlympiads.length,
          parsedAt: new Date().toISOString(),
          source: 'olimpiada.ru'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error parsing olympiads:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse olympiads';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
