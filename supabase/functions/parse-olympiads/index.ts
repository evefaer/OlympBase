import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// Subject-specific pages on olimpiada.ru for more complete coverage
const SUBJECT_PAGES = [
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=1&class=any&period_date=&period=year', subject: 'Математика' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=2&class=any&period_date=&period=year', subject: 'Физика' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=3&class=any&period_date=&period=year', subject: 'Информатика' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=4&class=any&period_date=&period=year', subject: 'Химия' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=5&class=any&period_date=&period=year', subject: 'Биология' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=6&class=any&period_date=&period=year', subject: 'Русский язык' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=7&class=any&period_date=&period=year', subject: 'Литература' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=8&class=any&period_date=&period=year', subject: 'История' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=9&class=any&period_date=&period=year', subject: 'Обществознание' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=10&class=any&period_date=&period=year', subject: 'География' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=11&class=any&period_date=&period=year', subject: 'Английский язык' },
];

async function scrapeSubjectPage(
  apiKey: string, 
  pageUrl: string, 
  defaultSubject: string
): Promise<ParsedOlympiad[]> {
  console.log(`Scraping page for ${defaultSubject}: ${pageUrl}`);
  
  try {
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: pageUrl,
        formats: ['markdown', 'extract'],
        extract: {
          prompt: `Extract all olympiads/competitions from this page. The page is filtered for ${defaultSubject} subject.
            
            For each olympiad extract:
            - title: the exact name of the olympiad (required)
            - subject: use "${defaultSubject}" as the subject
            - grades: array of grade numbers as strings (like ["9", "10", "11"]), extract from the page or use ["5", "6", "7", "8", "9", "10", "11"] if not specified
            - scale: the level - "Всероссийская" for national, "Региональная" for regional, "Международная" for international, "Межрегиональная" for multi-regional
            - startDate: start date in YYYY-MM-DD format (required, use current month if not clear)
            - endDate: end date in YYYY-MM-DD format (required, use 1-2 weeks after start if not clear)
            - registrationDeadline: registration deadline in YYYY-MM-DD format (use startDate minus 1 week if not specified)
            - description: brief description of the olympiad (1-2 sentences about what it is)
            - website: official website URL if available (null if not found)
            - organizer: organizing institution if mentioned (null if not found)
            - format: format of the olympiad - "Очная" for in-person, "Заочная" for correspondence, "Онлайн" for online, "Смешанная" for mixed (null if not clear)
            
            IMPORTANT: Extract ALL olympiads visible on the page. Include both upcoming and currently running olympiads.
            Return an array of olympiad objects. Be thorough and extract as many as possible.`,
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
        waitFor: 5000, // Increased wait time for better page loading
      }),
    });

    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.json();
      console.error(`Failed to scrape ${defaultSubject}:`, errorData);
      return [];
    }

    const scrapeData = await scrapeResponse.json();
    const extractData = scrapeData.data?.extract || scrapeData.extract;
    const olympiads: ParsedOlympiad[] = extractData?.olympiads || [];
    
    // Ensure subject is set correctly
    const olympiadsWithSubject = olympiads.map(o => ({
      ...o,
      subject: o.subject || defaultSubject,
    }));

    console.log(`Found ${olympiadsWithSubject.length} olympiads for ${defaultSubject}`);
    return olympiadsWithSubject;
  } catch (error) {
    console.error(`Error scraping ${defaultSubject}:`, error);
    return [];
  }
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Database not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional parameters
    let subjectsToScrape = SUBJECT_PAGES;
    try {
      const body = await req.json();
      if (body.subjects && Array.isArray(body.subjects)) {
        // Filter to only requested subjects
        subjectsToScrape = SUBJECT_PAGES.filter(p => 
          body.subjects.includes(p.subject)
        );
      }
    } catch {
      // No body or invalid JSON, use all subjects
    }

    console.log(`Starting olympiad parsing for ${subjectsToScrape.length} subjects`);
    console.log('Subjects:', subjectsToScrape.map(s => s.subject).join(', '));

    // Scrape pages in batches to avoid rate limiting
    const BATCH_SIZE = 3;
    const allOlympiads: ParsedOlympiad[] = [];
    
    for (let i = 0; i < subjectsToScrape.length; i += BATCH_SIZE) {
      const batch = subjectsToScrape.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(subjectsToScrape.length / BATCH_SIZE)}`);
      
      const batchResults = await Promise.all(
        batch.map(page => scrapeSubjectPage(apiKey, page.url, page.subject))
      );
      
      batchResults.forEach(olympiads => {
        allOlympiads.push(...olympiads);
      });
      
      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < subjectsToScrape.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Total olympiads scraped: ${allOlympiads.length}`);

    // Validate and clean up the data
    const validOlympiads = allOlympiads.filter((o: ParsedOlympiad) => {
      const isValid = o.title && o.subject && o.grades?.length > 0 && o.startDate && o.endDate;
      if (!isValid) {
        console.log(`Invalid olympiad skipped: ${o.title || 'no title'}`);
      }
      return isValid;
    });

    console.log(`${validOlympiads.length} olympiads passed validation`);

    // Deduplicate by title (case-insensitive)
    const seenTitles = new Set<string>();
    const uniqueOlympiads = validOlympiads.filter(o => {
      const titleLower = o.title.toLowerCase().trim();
      if (seenTitles.has(titleLower)) {
        return false;
      }
      seenTitles.add(titleLower);
      return true;
    });

    console.log(`${uniqueOlympiads.length} unique olympiads after deduplication`);

    // Get existing olympiads to avoid duplicates in database
    const { data: existingOlympiads } = await supabase
      .from('olympiads')
      .select('title');
    
    const existingTitles = new Set((existingOlympiads || []).map(o => o.title.toLowerCase().trim()));

    // Filter out duplicates and prepare for insertion
    const newOlympiads = uniqueOlympiads
      .filter(o => !existingTitles.has(o.title.toLowerCase().trim()))
      .map(o => ({
        title: o.title.trim(),
        subject: o.subject,
        grades: o.grades.map(g => String(g).trim()),
        scale: o.scale || 'Всероссийская',
        start_date: o.startDate,
        end_date: o.endDate,
        registration_deadline: o.registrationDeadline || o.startDate,
        description: o.description || `Олимпиада по предмету ${o.subject}`,
        website: o.website || null,
        organizer: o.organizer || null,
        format: o.format || null,
      }));

    console.log(`${newOlympiads.length} new olympiads to insert (${uniqueOlympiads.length - newOlympiads.length} already exist in database)`);

    let insertedCount = 0;
    if (newOlympiads.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('olympiads')
        .insert(newOlympiads)
        .select();

      if (insertError) {
        console.error('Error inserting olympiads:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: `Database insert failed: ${insertError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      insertedCount = inserted?.length || 0;
      console.log(`Successfully inserted ${insertedCount} olympiads into database`);
    }

    // Log summary by subject
    const bySubject = new Map<string, number>();
    uniqueOlympiads.forEach(o => {
      bySubject.set(o.subject, (bySubject.get(o.subject) || 0) + 1);
    });
    console.log('Olympiads by subject:', Object.fromEntries(bySubject));

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          totalScraped: allOlympiads.length,
          validated: validOlympiads.length,
          unique: uniqueOlympiads.length,
          inserted: insertedCount,
          skippedDuplicates: uniqueOlympiads.length - newOlympiads.length,
          bySubject: Object.fromEntries(bySubject),
          parsedAt: new Date().toISOString(),
          source: 'olimpiada.ru',
          subjectsParsed: subjectsToScrape.map(s => s.subject),
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
