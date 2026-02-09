import { useState } from "react";
import { ChevronDown, X, Filter } from "lucide-react";
import { Subject, Grade, Scale, SUBJECTS, GRADES, SCALES } from "@/data/olympiads";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { SearchInput } from "@/components/SearchInput";

export type TimeFilter = "all" | "upcoming" | "past";

export type ViewMode = "all" | "selected" | "custom";

interface FilterPanelProps {
  selectedSubjects: Subject[];
  selectedGrades: Grade[];
  selectedScales: Scale[];
  onSubjectsChange: (subjects: Subject[]) => void;
  onGradesChange: (grades: Grade[]) => void;
  onScalesChange: (scales: Scale[]) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  selectedCount: number;
  customCount: number;
  showDateRange?: boolean;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  timeFilter?: TimeFilter;
  onTimeFilterChange?: (filter: TimeFilter) => void;
}

export function FilterPanel({
  selectedSubjects,
  selectedGrades,
  selectedScales,
  onSubjectsChange,
  onGradesChange,
  onScalesChange,
  viewMode,
  onViewModeChange,
  selectedCount,
  customCount,
  showDateRange = false,
  dateRange,
  onDateRangeChange,
  searchQuery = "",
  onSearchChange,
  timeFilter = "all",
  onTimeFilterChange,
}: FilterPanelProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const toggleSubject = (subject: Subject) => {
    if (selectedSubjects.includes(subject)) {
      onSubjectsChange(selectedSubjects.filter((s) => s !== subject));
    } else {
      onSubjectsChange([...selectedSubjects, subject]);
    }
  };

  const toggleGrade = (grade: Grade) => {
    if (selectedGrades.includes(grade)) {
      onGradesChange(selectedGrades.filter((g) => g !== grade));
    } else {
      onGradesChange([...selectedGrades, grade]);
    }
  };

  const toggleScale = (scale: Scale) => {
    if (selectedScales.includes(scale)) {
      onScalesChange(selectedScales.filter((s) => s !== scale));
    } else {
      onScalesChange([...selectedScales, scale]);
    }
  };

  const clearAllFilters = () => {
    onSubjectsChange([]);
    onGradesChange([]);
    onScalesChange([]);
    if (onDateRangeChange) {
      onDateRangeChange({ from: undefined, to: undefined });
    }
    if (onSearchChange) {
      onSearchChange("");
    }
    if (onTimeFilterChange) {
      onTimeFilterChange("upcoming");
    }
  };

  const hasFilters =
    selectedSubjects.length > 0 ||
    selectedGrades.length > 0 ||
    selectedScales.length > 0 ||
    (dateRange?.from || dateRange?.to) ||
    searchQuery.trim().length > 0 ||
    timeFilter !== "all";

  return (
    <div className="bg-card rounded-xl border border-border p-3 sm:p-4 mb-4 sm:mb-6 animate-fade-in">
      {/* Search Input */}
      {onSearchChange && (
        <div className="mb-3 sm:mb-4">
          <SearchInput value={searchQuery} onChange={onSearchChange} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
          <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">Фильтры</span>
        </div>

        {/* Subject Filter */}
        <Popover open={openFilter === "subject"} onOpenChange={(open) => setOpenFilter(open ? "subject" : null)}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              Предмет
              {selectedSubjects.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {selectedSubjects.length}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={cn(
                    "filter-chip text-left text-xs",
                    selectedSubjects.includes(subject) ? "filter-chip-active" : "filter-chip-inactive"
                  )}
                >
                  {subject}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Grade Filter */}
        <Popover open={openFilter === "grade"} onOpenChange={(open) => setOpenFilter(open ? "grade" : null)}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              Класс
              {selectedGrades.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {selectedGrades.length}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="start">
            <div className="flex flex-wrap gap-2">
              {GRADES.map((grade) => (
                <button
                  key={grade}
                  onClick={() => toggleGrade(grade)}
                  className={cn(
                    "filter-chip min-w-[40px]",
                    selectedGrades.includes(grade) ? "filter-chip-active" : "filter-chip-inactive"
                  )}
                >
                  {grade}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Scale Filter */}
        <Popover open={openFilter === "scale"} onOpenChange={(open) => setOpenFilter(open ? "scale" : null)}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              Масштаб
              {selectedScales.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {selectedScales.length}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="start">
            <div className="flex flex-col gap-2">
              {SCALES.map((scale) => (
                <button
                  key={scale}
                  onClick={() => toggleScale(scale)}
                  className={cn(
                    "filter-chip text-left",
                    selectedScales.includes(scale) ? "filter-chip-active" : "filter-chip-inactive"
                  )}
                >
                  {scale}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Range Filter */}
        {showDateRange && onDateRangeChange && (
          <Popover open={openFilter === "date"} onOpenChange={(open) => setOpenFilter(open ? "date" : null)}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd.MM", { locale: ru })} —{" "}
                      {format(dateRange.to, "dd.MM", { locale: ru })}
                    </>
                  ) : (
                    format(dateRange.from, "dd.MM.yyyy", { locale: ru })
                  )
                ) : (
                  "Даты"
                )}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{ from: dateRange?.from, to: dateRange?.to }}
                onSelect={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
                numberOfMonths={1}
                locale={ru}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        )}

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      {/* Time Filter Toggle */}
      {onTimeFilterChange && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <span className="text-sm text-muted-foreground">Период:</span>
          <div className="flex bg-secondary rounded-lg p-1 overflow-x-auto">
            <button
              onClick={() => onTimeFilterChange("all")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                timeFilter === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Все
            </button>
            <button
              onClick={() => onTimeFilterChange("upcoming")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                timeFilter === "upcoming" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Предстоящие
            </button>
            <button
              onClick={() => onTimeFilterChange("past")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                timeFilter === "past" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              Прошедшие
            </button>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-sm text-muted-foreground">Показать:</span>
        <div className="flex bg-secondary rounded-lg p-1 overflow-x-auto">
          <button
            onClick={() => onViewModeChange("all")}
            className={cn(
              "px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              viewMode === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Все
          </button>
          <button
            onClick={() => onViewModeChange("selected")}
            className={cn(
              "px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
              viewMode === "selected" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Выбранные
            {selectedCount > 0 && (
              <span className="bg-warning text-warning-foreground text-xs px-1.5 py-0.5 rounded-full">
                {selectedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onViewModeChange("custom")}
            className={cn(
              "px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
              viewMode === "custom" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Добавленные
            {customCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {customCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
