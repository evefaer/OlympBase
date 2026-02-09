import { useMemo, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOlympiads } from "@/hooks/useOlympiads";
import { parseISO, isToday, isTomorrow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNotificationMode } from "@/hooks/useNotificationMode";
import { useSelectedOlympiads } from "@/hooks/useSelectedOlympiads";

export function UpcomingReminder() {
  const { data: olympiadsData = [] } = useOlympiads();
  const [dismissed, setDismissed] = useState(false);
  const { mode } = useNotificationMode();
  const { isSelected } = useSelectedOlympiads();

  const upcomingOlympiads = useMemo(() => {
    return olympiadsData.filter((olympiad) => {
      const startDate = parseISO(olympiad.startDate);
      const isUpcoming = isToday(startDate) || isTomorrow(startDate);
      if (!isUpcoming) return false;
      if (mode === "selected" && !isSelected(olympiad.id)) return false;
      return true;
    });
  }, [olympiadsData, mode, isSelected]);

  if (upcomingOlympiads.length === 0 || dismissed) return null;

  const todayOlympiads = upcomingOlympiads.filter((o) => isToday(parseISO(o.startDate)));
  const tomorrowOlympiads = upcomingOlympiads.filter((o) => isTomorrow(parseISO(o.startDate)));

  return (
    <div className="container pt-3 sm:pt-4 px-3 sm:px-4">
      <div className="relative bg-primary/10 border border-primary/30 rounded-lg p-3 sm:p-4 pr-10 animate-fade-in">
        <div className="flex items-start gap-2 sm:gap-3">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h5 className="text-sm sm:text-base font-semibold text-primary mb-1 sm:mb-2">
              Напоминание о предстоящих олимпиадах
            </h5>
            <div className="space-y-1.5 sm:space-y-2">
              {todayOlympiads.length > 0 && (
                <div>
                  <span className="font-medium text-sm text-destructive">Сегодня:</span>
                  <ul className="list-disc list-inside ml-1 sm:ml-2">
                    {todayOlympiads.map((o) => (
                      <li key={o.id} className="text-xs sm:text-sm text-foreground/80">
                        {o.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tomorrowOlympiads.length > 0 && (
                <div>
                  <span className="font-medium text-sm text-amber-600">Завтра:</span>
                  <ul className="list-disc list-inside ml-1 sm:ml-2">
                    {tomorrowOlympiads.map((o) => (
                      <li key={o.id} className="text-xs sm:text-sm text-foreground/80">
                        {o.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          className="absolute top-2 right-2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          onClick={() => setDismissed(true)}
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
