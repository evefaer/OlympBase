import { Star, Calendar, Users, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Olympiad, SUBJECT_COLORS } from "@/data/olympiads";
import { cn } from "@/lib/utils";

interface OlympiadCardProps {
  olympiad: Olympiad;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export function OlympiadCard({ olympiad, isSelected, onToggleSelect }: OlympiadCardProps) {
  const startDate = parseISO(olympiad.startDate);
  const endDate = parseISO(olympiad.endDate);
  const isSameDay = olympiad.startDate === olympiad.endDate;

  const dateDisplay = isSameDay
    ? format(startDate, "d MMMM yyyy", { locale: ru })
    : `${format(startDate, "d MMM", { locale: ru })} — ${format(endDate, "d MMM yyyy", { locale: ru })}`;

  return (
    <div className="card-olimpiad group animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("olimpiad-dot", SUBJECT_COLORS[olympiad.subject])} />
          <span className="text-sm font-medium text-muted-foreground">
            {olympiad.subject}
          </span>
        </div>
        <button
          onClick={() => onToggleSelect(olympiad.id)}
          className={cn(
            "p-1.5 rounded-lg transition-all",
            isSelected
              ? "bg-warning/10 text-warning"
              : "bg-secondary text-muted-foreground hover:text-warning hover:bg-warning/10"
          )}
          aria-label={isSelected ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <Star className={cn("w-4 h-4", isSelected && "fill-current")} />
        </button>
      </div>

      <h3 className="font-semibold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
        {olympiad.title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {olympiad.description}
      </p>

      <div className="flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{dateDisplay}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{olympiad.grades.join(", ")} класс</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{olympiad.scale}</span>
        </div>
      </div>
    </div>
  );
}
