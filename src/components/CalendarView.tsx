import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, ExternalLink } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { ru } from "date-fns/locale";
import { Olympiad, SUBJECT_COLORS } from "@/data/olympiads";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarViewProps {
  olympiads: Olympiad[];
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
}

export function CalendarView({ olympiads, isSelected, onToggleSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const olympiadsByDate = useMemo(() => {
    const map = new Map<string, Olympiad[]>();
    
    olympiads.forEach((olympiad) => {
      const start = parseISO(olympiad.startDate);
      const end = parseISO(olympiad.endDate);
      
      const daysInRange = eachDayOfInterval({ start, end });
      daysInRange.forEach((day) => {
        const dateKey = format(day, "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(olympiad);
      });
    });
    
    return map;
  }, [olympiads]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: ru })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayOlympiads = olympiadsByDate.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);

          return (
            <Popover key={dateKey}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "calendar-day min-h-[80px] border border-transparent hover:border-border rounded-lg transition-all",
                    !isCurrentMonth && "calendar-day-other opacity-40",
                    isToday && "calendar-day-current",
                    dayOlympiads.length > 0 && "cursor-pointer hover:bg-secondary/50"
                  )}
                  disabled={dayOlympiads.length === 0}
                >
                  <span
                    className={cn(
                      "text-sm font-medium mb-1",
                      isToday && "text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {dayOlympiads.slice(0, 3).map((olympiad) => (
                      <span
                        key={olympiad.id}
                        className={cn("olimpiad-dot", SUBJECT_COLORS[olympiad.subject])}
                        title={olympiad.title}
                      />
                    ))}
                    {dayOlympiads.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{dayOlympiads.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              </PopoverTrigger>
              {dayOlympiads.length > 0 && (
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-3 border-b border-border">
                    <h3 className="font-semibold">
                      {format(day, "d MMMM yyyy", { locale: ru })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {dayOlympiads.length} олимпиад{dayOlympiads.length === 1 ? "а" : dayOlympiads.length < 5 ? "ы" : ""}
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {dayOlympiads.map((olympiad) => (
                      <div
                        key={olympiad.id}
                        className="p-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={cn(
                                  "olimpiad-dot flex-shrink-0",
                                  SUBJECT_COLORS[olympiad.subject]
                                )}
                              />
                              <span className="text-xs text-muted-foreground">
                                {olympiad.subject}
                              </span>
                            </div>
                            <Link 
                              to={`/olympiad/${olympiad.id}`}
                              className="text-sm font-medium truncate block hover:text-primary transition-colors"
                            >
                              {olympiad.title}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">
                              {olympiad.scale} • {olympiad.grades.join(", ")} кл.
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Link
                              to={`/olympiad/${olympiad.id}`}
                              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelect(olympiad.id);
                              }}
                              className={cn(
                                "p-1.5 rounded-lg transition-all",
                                isSelected(olympiad.id)
                                  ? "bg-warning/10 text-warning"
                                  : "bg-secondary text-muted-foreground hover:text-warning hover:bg-warning/10"
                              )}
                            >
                              <Star
                                className={cn(
                                  "w-4 h-4",
                                  isSelected(olympiad.id) && "fill-current"
                                )}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              )}
            </Popover>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-2">Предметы:</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(SUBJECT_COLORS).slice(0, 6).map(([subject, color]) => (
            <div key={subject} className="flex items-center gap-1.5">
              <span className={cn("olimpiad-dot", color)} />
              <span className="text-xs text-muted-foreground">{subject}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
