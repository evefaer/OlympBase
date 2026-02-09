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

// olimpiada.ru subject pages
const OLIMPIADA_RU_PAGES = [
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
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=12&class=any&period_date=&period=year', subject: 'Экономика' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=13&class=any&period_date=&period=year', subject: 'Право' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=14&class=any&period_date=&period=year', subject: 'Астрономия' },
  { url: 'https://olimpiada.ru/activities?type=any&subject%5B%5D=15&class=any&period_date=&period=year', subject: 'Экология' },
];

// postupi.online olympiad pages
const POSTUPI_ONLINE_PAGES = [
  { url: 'https://postupi.online/olimpiady/predmet-matematika/', subject: 'Математика' },
  { url: 'https://postupi.online/olimpiady/predmet-fizika/', subject: 'Физика' },
  { url: 'https://postupi.online/olimpiady/predmet-informatika/', subject: 'Информатика' },
  { url: 'https://postupi.online/olimpiady/predmet-himiya/', subject: 'Химия' },
  { url: 'https://postupi.online/olimpiady/predmet-biologiya/', subject: 'Биология' },
  { url: 'https://postupi.online/olimpiady/predmet-russkiy-yazyk/', subject: 'Русский язык' },
  { url: 'https://postupi.online/olimpiady/predmet-literatura/', subject: 'Литература' },
  { url: 'https://postupi.online/olimpiady/predmet-istoriya/', subject: 'История' },
  { url: 'https://postupi.online/olimpiady/predmet-obschestvoznanie/', subject: 'Обществознание' },
  { url: 'https://postupi.online/olimpiady/predmet-geografiya/', subject: 'География' },
  { url: 'https://postupi.online/olimpiady/predmet-angliyskiy-yazyk/', subject: 'Английский язык' },
  { url: 'https://postupi.online/olimpiady/predmet-ekonomika/', subject: 'Экономика' },
  { url: 'https://postupi.online/olimpiady/predmet-pravo/', subject: 'Право' },
  { url: 'https://postupi.online/olimpiady/predmet-astronomiya/', subject: 'Астрономия' },
  { url: 'https://postupi.online/olimpiady/predmet-ekologiya/', subject: 'Экология' },
];

const EXTRACT_PROMPT = `Extract ALL olympiads/competitions from this page. Be as thorough as possible — extract every single one.

For each olympiad extract:
- title: the exact full name of the olympiad (required)
- subject: the subject/discipline (required)
- grades: array of grade numbers as strings (like ["9", "10", "11"]). Extract from the page, or use ["5","6","7","8","9","10","11"] if not specified
- scale: "Всероссийская" for national, "Региональная" for regional, "Международная" for international, "Межрегиональная" for multi-regional
- startDate: start date in YYYY-MM-DD format (required)
- endDate: end date in YYYY-MM-DD format (required)
- registrationDeadline: registration deadline in YYYY-MM-DD format (use startDate minus 1 week if not specified)
- description: brief description 1-2 sentences
- website: official website URL if available (null if not found)
- organizer: organizing institution (null if not found)
- format: "Очная", "Заочная", "Онлайн", or "Смешанная" (null if unclear)

IMPORTANT: Extract EVERY olympiad on the page. Do not skip any. Include upcoming, ongoing, and recently finished ones.`;

const EXTRACT_SCHEMA = {
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
          format: { type: 'string' },
        },
        required: ['title', 'subject', 'grades', 'scale', 'startDate', 'endDate', 'registrationDeadline', 'description'],
      },
    },
  },
  required: ['olympiads'],
};

function isOlderThanOneMonth(endDate: string): boolean {
  const end = new Date(endDate);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return end < cutoff;
}

function getCutoffDateISO(): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return cutoff.toISOString().split('T')[0];
}

async function scrapePage(
  apiKey: string,
  pageUrl: string,
  defaultSubject: string,
): Promise<ParsedOlympiad[]> {
  console.log(`Scraping: ${defaultSubject} — ${pageUrl}`);
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: pageUrl,
        formats: ['markdown', 'extract'],
        extract: {
          prompt: `${EXTRACT_PROMPT}\nThe page is filtered for subject: ${defaultSubject}. Use "${defaultSubject}" as the subject value.`,
          schema: EXTRACT_SCHEMA,
        },
        onlyMainContent: true,
        waitFor: 5000,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(`Failed ${defaultSubject}:`, err);
      return [];
    }

    const data = await res.json();
    const extract = data.data?.extract || data.extract;
    const olympiads: ParsedOlympiad[] = (extract?.olympiads || []).map((o: ParsedOlympiad) => ({
      ...o,
      subject: o.subject || defaultSubject,
    }));

    console.log(`Found ${olympiads.length} for ${defaultSubject}`);
    return olympiads;
  } catch (e) {
    console.error(`Error scraping ${defaultSubject}:`, e);
    return [];
  }
}

async function scrapeInBatches(
  apiKey: string,
  pages: { url: string; subject: string }[],
  batchSize: number,
): Promise<ParsedOlympiad[]> {
  const all: ParsedOlympiad[] = [];
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);
    console.log(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pages.length / batchSize)}`);
    const results = await Promise.all(batch.map((p) => scrapePage(apiKey, p.url, p.subject)));
    results.forEach((r) => all.push(...r));
    if (i + batchSize < pages.length) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return all;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Database not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Optional subject filter from request body
    let filterSubjects: string[] | null = null;
    try {
      const body = await req.json();
      if (body.subjects && Array.isArray(body.subjects)) {
        filterSubjects = body.subjects;
      }
    } catch {
      // no body
    }

    const olimpiadaPages = filterSubjects
      ? OLIMPIADA_RU_PAGES.filter((p) => filterSubjects!.includes(p.subject))
      : OLIMPIADA_RU_PAGES;

    const postupiPages = filterSubjects
      ? POSTUPI_ONLINE_PAGES.filter((p) => filterSubjects!.includes(p.subject))
      : POSTUPI_ONLINE_PAGES;

    console.log(`Scraping ${olimpiadaPages.length} olimpiada.ru + ${postupiPages.length} postupi.online pages`);

    // Scrape both sources
    const [olimpiadaResults, postupiResults] = await Promise.all([
      scrapeInBatches(apiKey, olimpiadaPages, 3),
      scrapeInBatches(apiKey, postupiPages, 3),
    ]);

    const allOlympiads = [...olimpiadaResults, ...postupiResults];
    console.log(`Total scraped: ${allOlympiads.length} (olimpiada.ru: ${olimpiadaResults.length}, postupi.online: ${postupiResults.length})`);

    // Validate
    const valid = allOlympiads.filter((o) => o.title && o.subject && o.grades?.length > 0 && o.startDate && o.endDate);
    console.log(`Valid: ${valid.length}`);

    // Filter out olympiads older than 1 month
    const fresh = valid.filter((o) => !isOlderThanOneMonth(o.endDate));
    console.log(`After date filter (not older than 1 month): ${fresh.length}`);

    // Deduplicate by title
    const seen = new Set<string>();
    const unique = fresh.filter((o) => {
      const key = o.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`Unique: ${unique.length}`);

    // Get existing titles to skip duplicates
    const { data: existing } = await supabase.from('olympiads').select('title');
    const existingTitles = new Set((existing || []).map((o: { title: string }) => o.title.toLowerCase().trim()));

    const newOlympiads = unique
      .filter((o) => !existingTitles.has(o.title.toLowerCase().trim()))
      .map((o) => ({
        title: o.title.trim(),
        subject: o.subject,
        grades: o.grades.map((g) => String(g).trim()),
        scale: o.scale || 'Всероссийская',
        start_date: o.startDate,
        end_date: o.endDate,
        registration_deadline: o.registrationDeadline || o.startDate,
        description: o.description || `Олимпиада по предмету ${o.subject}`,
        website: o.website || null,
        organizer: o.organizer || null,
        format: o.format || null,
      }));

    console.log(`New to insert: ${newOlympiads.length}`);

    // Insert in chunks of 50
    let insertedCount = 0;
    for (let i = 0; i < newOlympiads.length; i += 50) {
      const chunk = newOlympiads.slice(i, i + 50);
      const { data: inserted, error } = await supabase.from('olympiads').insert(chunk).select();
      if (error) {
        console.error(`Insert error at chunk ${i}:`, error);
      } else {
        insertedCount += inserted?.length || 0;
      }
    }
    console.log(`Inserted: ${insertedCount}`);

    // Cleanup: remove olympiads older than 1 month from DB
    const cutoffDate = getCutoffDateISO();
    const { count: deletedCount } = await supabase
      .from('olympiads')
      .delete({ count: 'exact' })
      .lt('end_date', cutoffDate);
    console.log(`Cleaned up ${deletedCount || 0} expired olympiads (end_date < ${cutoffDate})`);

    // Summary by subject
    const bySubject: Record<string, number> = {};
    unique.forEach((o) => {
      bySubject[o.subject] = (bySubject[o.subject] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          totalScraped: allOlympiads.length,
          validated: valid.length,
          fresh: fresh.length,
          unique: unique.length,
          inserted: insertedCount,
          cleaned: deletedCount || 0,
          bySubject,
          sources: ['olimpiada.ru', 'postupi.online'],
          parsedAt: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to parse' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
