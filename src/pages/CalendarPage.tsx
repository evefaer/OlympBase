import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { FilterPanel, TimeFilter, ViewMode } from "@/components/FilterPanel";
import { CalendarView } from "@/components/CalendarView";
import { UpcomingReminder } from "@/components/UpcomingReminder";
import { AddOlympiadDialog } from "@/components/AddOlympiadDialog";
import { useSelectedOlympiads } from "@/hooks/useSelectedOlympiads";
import { useOlympiads } from "@/hooks/useOlympiads";
import { useCustomOlympiads } from "@/hooks/useCustomOlympiads";
import { Subject, Grade, Scale } from "@/data/olympiads";
import { parseISO, isBefore, startOfDay } from "date-fns";

const CalendarPage = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);
  const [selectedScales, setSelectedScales] = useState<Scale[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const { isSelected, toggleSelected, selectedCount } = useSelectedOlympiads();
  const { data: olympiadsData = [], isLoading } = useOlympiads();
  const { isCustomOlympiad, customOlympiads } = useCustomOlympiads();

  const filteredOlympiads = useMemo(() => {
    return olympiadsData.filter((olympiad) => {
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
    });
  }, [olympiadsData, selectedSubjects, selectedGrades, selectedScales, viewMode, searchQuery, timeFilter, isSelected, isCustomOlympiad]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <UpcomingReminder />
      
      <main className="container py-4 sm:py-8 px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
              Календарь олимпиад
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Планируйте участие и не пропускайте важные даты
            </p>
          </div>
          <AddOlympiadDialog />
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
        />

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground animate-fade-in">
            <p className="text-lg">Загрузка олимпиад...</p>
          </div>
        ) : (
          <>
            <CalendarView
              olympiads={filteredOlympiads}
              isSelected={isSelected}
              onToggleSelect={toggleSelected}
            />

            {filteredOlympiads.length === 0 && (
              <div className="text-center py-12 text-muted-foreground animate-fade-in">
                <p className="text-lg">Нет олимпиад по выбранным фильтрам</p>
                <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CalendarPage;
