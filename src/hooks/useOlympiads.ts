import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Subject, Grade, Scale, Olympiad } from "@/data/olympiads";
import { useCustomOlympiads } from "./useCustomOlympiads";
import { useMemo } from "react";

interface OlympiadRow {
  id: string;
  title: string;
  subject: string;
  grades: string[];
  scale: string;
  start_date: string;
  end_date: string;
  description: string;
  registration_deadline: string;
  website: string | null;
  requirements: string[] | null;
  organizer: string | null;
  format: string | null;
  prizes: string[] | null;
  created_at: string;
  updated_at: string;
}

function mapRowToOlympiad(row: OlympiadRow): Olympiad {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject as Subject,
    grades: row.grades as Grade[],
    scale: row.scale as Scale,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    registrationDeadline: row.registration_deadline,
    website: row.website || undefined,
    requirements: row.requirements || undefined,
    organizer: row.organizer || undefined,
    format: row.format as Olympiad["format"] || undefined,
    prizes: row.prizes || undefined,
  };
}

export function useOlympiads() {
  const { customOlympiads } = useCustomOlympiads();
  
  const query = useQuery({
    queryKey: ["olympiads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("olympiads")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) {
        throw error;
      }

      return (data as OlympiadRow[]).map(mapRowToOlympiad);
    },
  });

  // Merge database olympiads with custom ones
  const allOlympiads = useMemo(() => {
    const dbOlympiads = query.data || [];
    return [...dbOlympiads, ...customOlympiads].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [query.data, customOlympiads]);

  return {
    ...query,
    data: allOlympiads,
  };
}

export function useOlympiad(id: string) {
  const { customOlympiads } = useCustomOlympiads();
  
  // Check if it's a custom olympiad first
  const customOlympiad = customOlympiads.find((o) => o.id === id);
  
  const query = useQuery({
    queryKey: ["olympiad", id],
    queryFn: async () => {
      // If it's a custom olympiad, return it directly
      if (id.startsWith("custom-")) {
        return null;
      }
      
      const { data, error } = await supabase
        .from("olympiads")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      return mapRowToOlympiad(data as OlympiadRow);
    },
    enabled: !id.startsWith("custom-"),
  });

  return {
    ...query,
    data: customOlympiad || query.data,
    isLoading: id.startsWith("custom-") ? false : query.isLoading,
  };
}
