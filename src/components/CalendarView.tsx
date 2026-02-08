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
} from "date-fns";
import { ru } from "date-fns/locale";
import { Olympiad, SUBJECT_COLORS } from "@/data/olympiads";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SubjectIcon, SubjectIconWithLabel } from "@/components/SubjectIcon";

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
    <div className="bg-card rounded-xl border border-border p-3 sm:p-6 animate-fade-in">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base sm:text-xl font-semibold capitalize">
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
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
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
                    "calendar-day min-h-[60px] sm:min-h-[100px] md:min-h-[120px] border border-transparent hover:border-border rounded-lg transition-all p-1 sm:p-2 md:p-3",
                    !isCurrentMonth && "calendar-day-other opacity-40",
                    isToday && "calendar-day-current",
                    dayOlympiads.length > 0 && "cursor-pointer hover:bg-secondary/50"
                  )}
                  disabled={dayOlympiads.length === 0}
                >
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-medium mb-1",
                      isToday && "text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-1">
                    {/* На мобильных показываем только точки-индикаторы */}
                    <div className="sm:hidden flex gap-1 flex-wrap">
                      {dayOlympiads.slice(0, 3).map((olympiad) => (
                        <div
                          key={olympiad.id}
                          className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            SUBJECT_COLORS[olympiad.subject as keyof typeof SUBJECT_COLORS] || "bg-gray-400"
                          )}
                        />
                      ))}
                      {dayOlympiads.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{dayOlympiads.length - 3}
                        </span>
                      )}
                    </div>
                    {/* На десктопе показываем иконки */}
                    <div className="hidden sm:flex flex-wrap gap-1">
                      {dayOlympiads.slice(0, 2).map((olympiad) => (
                        <SubjectIcon
                          key={olympiad.id}
                          subject={olympiad.subject}
                          size="sm"
                        />
                      ))}
                      {dayOlympiads.length > 2 && (
                        <span className="text-xs text-muted-foreground font-medium self-end">
                          +{dayOlympiads.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </PopoverTrigger>
              {dayOlympiads.length > 0 && (
                <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm p-0" align="center" side="bottom">
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
                              <SubjectIcon subject={olympiad.subject} size="sm" />
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

      {/* Legend - на десктопе с иконками, на мобильных с точками */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
        <p className="text-xs sm:text-sm text-muted-foreground mb-2">Предметы:</p>
        {/* Мобильная версия с точками */}
        <div className="sm:hidden flex flex-wrap gap-x-3 gap-y-1.5">
          {Object.keys(SUBJECT_COLORS).map((subject) => (
            <div key={subject} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  SUBJECT_COLORS[subject as keyof typeof SUBJECT_COLORS]
                )}
              />
              <span className="text-xs text-muted-foreground">{subject}</span>
            </div>
          ))}
        </div>
        {/* Десктопная версия с иконками */}
        <div className="hidden sm:flex flex-wrap gap-x-4 gap-y-2">
          {Object.keys(SUBJECT_COLORS).map((subject) => (
            <SubjectIconWithLabel
              key={subject}
              subject={subject as keyof typeof SUBJECT_COLORS}
              size="sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
