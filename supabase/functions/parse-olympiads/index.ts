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

// olimpiada.ru — subject IDs mapped to names
const OLIMPIADA_SUBJECTS: Record<number, string> = {
  1: 'Математика', 2: 'Физика', 3: 'Информатика', 4: 'Химия',
  5: 'Биология', 6: 'Русский язык', 7: 'Литература', 8: 'История',
  9: 'Обществознание', 10: 'География', 11: 'Английский язык',
  12: 'Экономика', 13: 'Право', 14: 'Астрономия', 15: 'Экология',
  16: 'Немецкий язык', 17: 'Французский язык', 18: 'Китайский язык',
  19: 'Искусство', 20: 'Технология', 21: 'ОБЖ', 22: 'Физкультура',
};

function getOlimpiadaPages(filterSubjects?: string[]): { url: string; subject: string }[] {
  const pages: { url: string; subject: string }[] = [];
  for (const [id, subject] of Object.entries(OLIMPIADA_SUBJECTS)) {
    if (filterSubjects && !filterSubjects.includes(subject)) continue;
    pages.push({
      url: `https://olimpiada.ru/activities?type=any&subject%5B%5D=${id}&class=any&period_date=&period=year`,
      subject,
    });
  }
  return pages;
}

// postupi.online slug mapping
const POSTUPI_SUBJECTS: Record<string, string> = {
  'matematika': 'Математика', 'fizika': 'Физика', 'informatika': 'Информатика',
  'himiya': 'Химия', 'biologiya': 'Биология', 'russkiy-yazyk': 'Русский язык',
  'literatura': 'Литература', 'istoriya': 'История', 'obschestvoznanie': 'Обществознание',
  'geografiya': 'География', 'angliyskiy-yazyk': 'Английский язык',
  'ekonomika': 'Экономика', 'pravo': 'Право', 'astronomiya': 'Астрономия',
  'ekologiya': 'Экология', 'nemetskiy-yazyk': 'Немецкий язык',
  'frantsuzskiy-yazyk': 'Французский язык', 'kitayskiy-yazyk': 'Китайский язык',
  'iskusstvo': 'Искусство', 'tekhnologiya': 'Технология', 'obzh': 'ОБЖ',
  'fizicheskaya-kultura': 'Физкультура',
};

function getPostupiPages(filterSubjects?: string[]): { url: string; subject: string }[] {
  const pages: { url: string; subject: string }[] = [];
  for (const [slug, subject] of Object.entries(POSTUPI_SUBJECTS)) {
    if (filterSubjects && !filterSubjects.includes(subject)) continue;
    pages.push({ url: `https://postupi.online/olimpiady/predmet-${slug}/`, subject });
  }
  return pages;
}

const EXTRACT_PROMPT = `You are extracting olympiad/competition data from a Russian educational website. 
Extract EVERY SINGLE olympiad or competition listed on this page. Do NOT skip any.
Look through the ENTIRE page content carefully — tables, lists, cards, links, sidebars.

For each olympiad extract:
- title: the exact full official name (required). Do NOT abbreviate.
- subject: the subject/discipline (required)
- grades: array of grade numbers as strings (like ["9","10","11"]). Parse from text like "5-11 класс" → ["5","6","7","8","9","10","11"]. Use ["1","2","3","4","5","6","7","8","9","10","11"] if not specified.
- scale: "Всероссийская" for national/all-Russian, "Региональная" for regional, "Международная" for international, "Межрегиональная" for multi-regional, "Муниципальная" for city-level
- startDate: start date in YYYY-MM-DD format. Parse from Russian dates like "15 февраля 2026" → "2026-02-15". Required.
- endDate: end date in YYYY-MM-DD format. Required. If only one date given, use it as both start and end.
- registrationDeadline: deadline in YYYY-MM-DD format. Use 7 days before startDate if not found.
- description: 1-2 sentence description of the olympiad
- website: direct URL to the olympiad's page or official site (null if not found)
- organizer: who organizes it (null if not found)
- format: "Очная" (in-person), "Заочная" (correspondence), "Онлайн" (online), "Смешанная" (mixed). null if unclear.

CRITICAL: Extract ALL items. The more the better. Even if information is partial — include it with best guesses for missing fields.`;

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
        required: ['title', 'subject', 'startDate', 'endDate', 'description'],
      },
    },
  },
  required: ['olympiads'],
};

function isOlderThanOneMonth(endDate: string): boolean {
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return false; // keep if date is unparseable
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
          prompt: `${EXTRACT_PROMPT}\nThis page is for subject: ${defaultSubject}. Use "${defaultSubject}" as the subject value for all items.`,
          schema: EXTRACT_SCHEMA,
        },
        onlyMainContent: false, // scrape full page for maximum coverage
        waitFor: 3000,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`Failed ${defaultSubject} (${res.status}):`, err);
      return [];
    }

    const data = await res.json();
    const extract = data.data?.extract || data.extract;
    const raw = extract?.olympiads || [];

    const olympiads: ParsedOlympiad[] = raw.map((o: any) => ({
      title: o.title || '',
      subject: o.subject || defaultSubject,
      grades: Array.isArray(o.grades) ? o.grades : ['5','6','7','8','9','10','11'],
      scale: o.scale || 'Всероссийская',
      startDate: o.startDate || '',
      endDate: o.endDate || o.startDate || '',
      registrationDeadline: o.registrationDeadline || '',
      description: o.description || '',
      website: o.website || null,
      organizer: o.organizer || null,
      format: o.format || null,
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
    console.log(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pages.length / batchSize)} (${batch.map(b => b.subject).join(', ')})`);
    const results = await Promise.all(batch.map((p) => scrapePage(apiKey, p.url, p.subject)));
    results.forEach((r) => all.push(...r));
    if (i + batchSize < pages.length) {
      await new Promise((r) => setTimeout(r, 1000));
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

    // Optional subject filter
    let filterSubjects: string[] | undefined;
    try {
      const body = await req.json();
      if (body.subjects && Array.isArray(body.subjects)) {
        filterSubjects = body.subjects;
      }
    } catch {
      // no body
    }

    const olimpiadaPages = getOlimpiadaPages(filterSubjects);
    const postupiPages = getPostupiPages(filterSubjects);

    console.log(`Total pages to scrape: ${olimpiadaPages.length} olimpiada.ru + ${postupiPages.length} postupi.online = ${olimpiadaPages.length + postupiPages.length}`);

    // Scrape both sources in parallel batches of 4
    const [olimpiadaResults, postupiResults] = await Promise.all([
      scrapeInBatches(apiKey, olimpiadaPages, 4),
      scrapeInBatches(apiKey, postupiPages, 4),
    ]);

    const allOlympiads = [...olimpiadaResults, ...postupiResults];
    console.log(`Total scraped: ${allOlympiads.length} (olimpiada.ru: ${olimpiadaResults.length}, postupi.online: ${postupiResults.length})`);

    // Validate: require at least title and some date
    const valid = allOlympiads.filter((o) => {
      if (!o.title || o.title.length < 3) return false;
      if (!o.startDate && !o.endDate) return false;
      return true;
    });
    console.log(`Valid: ${valid.length}`);

    // Filter out olympiads older than 1 month
    const fresh = valid.filter((o) => !isOlderThanOneMonth(o.endDate));
    console.log(`Fresh (not older than 1 month): ${fresh.length}`);

    // Deduplicate by normalized title
    const seen = new Set<string>();
    const unique = fresh.filter((o) => {
      const key = o.title.toLowerCase().trim().replace(/\s+/g, ' ');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    console.log(`Unique: ${unique.length}`);

    // Get existing titles
    const { data: existing } = await supabase.from('olympiads').select('title');
    const existingTitles = new Set((existing || []).map((o: { title: string }) => o.title.toLowerCase().trim().replace(/\s+/g, ' ')));

    const newOlympiads = unique
      .filter((o) => !existingTitles.has(o.title.toLowerCase().trim().replace(/\s+/g, ' ')))
      .map((o) => ({
        title: o.title.trim(),
        subject: o.subject,
        grades: Array.isArray(o.grades) ? o.grades.map((g) => String(g).trim()) : ['5','6','7','8','9','10','11'],
        scale: o.scale || 'Всероссийская',
        start_date: o.startDate,
        end_date: o.endDate || o.startDate,
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
        console.error(`Insert error at chunk ${i}:`, error.message);
      } else {
        insertedCount += inserted?.length || 0;
      }
    }
    console.log(`Inserted: ${insertedCount}`);

    // Cleanup expired
    const cutoffDate = getCutoffDateISO();
    const { count: deletedCount } = await supabase
      .from('olympiads')
      .delete({ count: 'exact' })
      .lt('end_date', cutoffDate);
    console.log(`Cleaned up ${deletedCount || 0} expired (end_date < ${cutoffDate})`);

    // Summary
    const bySubject: Record<string, number> = {};
    unique.forEach((o) => { bySubject[o.subject] = (bySubject[o.subject] || 0) + 1; });

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
          alreadyExisted: unique.length - newOlympiads.length,
          bySubject,
          sources: ['olimpiada.ru', 'postupi.online'],
          pagesScraped: olimpiadaPages.length + postupiPages.length,
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
