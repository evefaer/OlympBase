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
