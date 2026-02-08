import { Link } from "react-router-dom";
import { Star, Calendar, Users, MapPin, Trash2, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Olympiad } from "@/data/olympiads";
import { cn } from "@/lib/utils";
import { SubjectIcon } from "@/components/SubjectIcon";
import { Badge } from "@/components/ui/badge";

interface OlympiadCardProps {
  olympiad: Olympiad;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  isCustom?: boolean;
  onDelete?: (id: string) => void;
}

export function OlympiadCard({ olympiad, isSelected, onToggleSelect, isCustom, onDelete }: OlympiadCardProps) {
  const startDate = parseISO(olympiad.startDate);
  const endDate = parseISO(olympiad.endDate);
  const isSameDay = olympiad.startDate === olympiad.endDate;

  const dateDisplay = isSameDay
    ? format(startDate, "d MMMM yyyy", { locale: ru })
    : `${format(startDate, "d MMM", { locale: ru })} — ${format(endDate, "d MMM yyyy", { locale: ru })}`;

  return (
    <div className="card-olimpiad group animate-fade-in relative">
      {isCustom && (
        <Badge variant="secondary" className="absolute top-2 right-2 text-xs gap-1">
          <User className="w-3 h-3" />
          Моя
        </Badge>
      )}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <SubjectIcon subject={olympiad.subject} size="sm" />
          <span className="text-sm font-medium text-muted-foreground">
            {olympiad.subject}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isCustom && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(olympiad.id);
              }}
              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              aria-label="Удалить олимпиаду"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelect(olympiad.id);
            }}
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
      </div>

      <Link to={`/olympiad/${olympiad.id}`}>
        <h3 className="font-semibold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors cursor-pointer">
          {olympiad.title}
        </h3>
      </Link>

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
