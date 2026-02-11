import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { FilterPanel, TimeFilter, ViewMode } from "@/components/FilterPanel";
import { OlympiadCard } from "@/components/OlympiadCard";
import { OlympiadCardSkeleton } from "@/components/OlympiadCardSkeleton";
import { UpcomingReminder } from "@/components/UpcomingReminder";
import { AddOlympiadDialog } from "@/components/AddOlympiadDialog";
import { useSelectedOlympiads } from "@/hooks/useSelectedOlympiads";
import { useOlympiads } from "@/hooks/useOlympiads";
import { useCustomOlympiads } from "@/hooks/useCustomOlympiads";
import { Subject, Grade, Scale } from "@/data/olympiads";
import { parseISO, isWithinInterval, isAfter, isBefore, startOfDay } from "date-fns";

const ListPage = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);
  const [selectedScales, setSelectedScales] = useState<Scale[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");

  const { isSelected, toggleSelected, selectedCount } = useSelectedOlympiads();
  const { isCustomOlympiad, deleteOlympiad, addOlympiad, customOlympiads } = useCustomOlympiads();
  const { data: olympiadsData = [], isLoading } = useOlympiads(customOlympiads);

  const filteredOlympiads = useMemo(() => {
    return olympiadsData
      .filter((olympiad) => {
        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          if (!olympiad.title.toLowerCase().includes(query)) {
            return false;
          }
        }

        // Filter by view mode
        if (viewMode === "selected" && !isSelected(olympiad.id)) {
          return false;
        }
        if (viewMode === "custom" && !isCustomOlympiad(olympiad.id)) {
          return false;
        }

        // Filter by subject
        if (selectedSubjects.length > 0 && !selectedSubjects.includes(olympiad.subject)) {
          return false;
        }

        // Filter by grade
        if (selectedGrades.length > 0) {
          const hasMatchingGrade = olympiad.grades.some((g) => selectedGrades.includes(g));
          if (!hasMatchingGrade) return false;
        }

        // Filter by scale
        if (selectedScales.length > 0 && !selectedScales.includes(olympiad.scale)) {
          return false;
        }

        // Filter by date range
        if (dateRange.from || dateRange.to) {
          const olympiadStart = parseISO(olympiad.startDate);
          const olympiadEnd = parseISO(olympiad.endDate);

          if (dateRange.from && dateRange.to) {
            // Check if olympiad overlaps with the date range
            const rangeOverlaps =
              isWithinInterval(olympiadStart, { start: dateRange.from, end: dateRange.to }) ||
              isWithinInterval(olympiadEnd, { start: dateRange.from, end: dateRange.to }) ||
              (isBefore(olympiadStart, dateRange.from) && isAfter(olympiadEnd, dateRange.to));
            if (!rangeOverlaps) return false;
          } else if (dateRange.from) {
            if (isBefore(olympiadEnd, dateRange.from)) return false;
          } else if (dateRange.to) {
            if (isAfter(olympiadStart, dateRange.to)) return false;
          }
        }

        // Filter by time (upcoming/past)
        if (timeFilter !== "all") {
          const today = startOfDay(new Date());
          const olympiadEnd = parseISO(olympiad.endDate);
          
          if (timeFilter === "upcoming" && isBefore(olympiadEnd, today)) {
            return false;
          }
          if (timeFilter === "past" && !isBefore(olympiadEnd, today)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  }, [olympiadsData, selectedSubjects, selectedGrades, selectedScales, viewMode, dateRange, searchQuery, timeFilter, isSelected, isCustomOlympiad]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <UpcomingReminder />
      
      <main className="container py-4 sm:py-8 px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
              Список олимпиад
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Найдите олимпиады по вашим интересам
            </p>
          </div>
          <AddOlympiadDialog onAdd={addOlympiad} />
        </div>

        <FilterPanel
          selectedSubjects={selectedSubjects}
          selectedGrades={selectedGrades}
          selectedScales={selectedScales}
          onSubjectsChange={setSelectedSubjects}
          onGradesChange={setSelectedGrades}
          onScalesChange={setSelectedScales}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedCount={selectedCount}
          customCount={customOlympiads.length}
          showDateRange
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <OlympiadCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredOlympiads.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredOlympiads.map((olympiad) => (
              <OlympiadCard
                key={olympiad.id}
                olympiad={olympiad}
                isSelected={isSelected(olympiad.id)}
                onToggleSelect={toggleSelected}
                isCustom={isCustomOlympiad(olympiad.id)}
                onDelete={deleteOlympiad}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground animate-fade-in">
            <p className="text-lg">Нет олимпиад по выбранным фильтрам</p>
            <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
          </div>
        )}

        {filteredOlympiads.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Найдено олимпиад: {filteredOlympiads.length}
          </div>
        )}
      </main>
    </div>
  );
};

export default ListPage;
