import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Calendar, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSelectedOlympiads } from "@/hooks/useSelectedOlympiads";
import { useOlympiads } from "@/hooks/useOlympiads";
import { parseISO, isToday, isTomorrow, format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function UpcomingReminder() {
  const { selectedIds } = useSelectedOlympiads();
  const { data: olympiadsData = [] } = useOlympiads();
  const [dismissed, setDismissed] = useState(false);

  const upcomingOlympiads = useMemo(() => {
    if (selectedIds.length === 0) return [];

    return olympiadsData.filter((olympiad) => {
      if (!selectedIds.includes(olympiad.id)) return false;
      const startDate = parseISO(olympiad.startDate);
      return isToday(startDate) || isTomorrow(startDate);
    });
  }, [selectedIds, olympiadsData]);

  if (upcomingOlympiads.length === 0 || dismissed) return null;

  const todayOlympiads = upcomingOlympiads.filter((o) => isToday(parseISO(o.startDate)));
  const tomorrowOlympiads = upcomingOlympiads.filter((o) => isTomorrow(parseISO(o.startDate)));

  return (
    <div className="container pt-4">
      <Alert className="bg-primary/10 border-primary/30 relative animate-fade-in">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-semibold">
          Напоминание о предстоящих олимпиадах
        </AlertTitle>
        <AlertDescription className="text-foreground/80">
          <div className="space-y-2 mt-2">
            {todayOlympiads.length > 0 && (
              <div>
                <span className="font-medium text-destructive">Сегодня:</span>
                <ul className="list-disc list-inside ml-2">
                  {todayOlympiads.map((o) => (
                    <li key={o.id} className="text-sm">
                      {o.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tomorrowOlympiads.length > 0 && (
              <div>
                <span className="font-medium text-amber-600">Завтра:</span>
                <ul className="list-disc list-inside ml-2">
                  {tomorrowOlympiads.map((o) => (
                    <li key={o.id} className="text-sm">
                      {o.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}
