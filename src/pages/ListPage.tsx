import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { FilterPanel } from "@/components/FilterPanel";
import { OlympiadCard } from "@/components/OlympiadCard";
import { useSelectedOlympiads } from "@/hooks/useSelectedOlympiads";
import { olympiadsData, Subject, Grade, Scale } from "@/data/olympiads";
import { parseISO, isWithinInterval, isAfter, isBefore } from "date-fns";

const ListPage = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);
  const [selectedScales, setSelectedScales] = useState<Scale[]>([]);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { isSelected, toggleSelected, selectedCount } = useSelectedOlympiads();

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

        // Filter by selected
        if (showOnlySelected && !isSelected(olympiad.id)) {
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

        return true;
      })
      .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  }, [selectedSubjects, selectedGrades, selectedScales, showOnlySelected, dateRange, searchQuery, isSelected]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Список олимпиад
          </h1>
          <p className="text-muted-foreground">
            Найдите олимпиады по вашим интересам и добавьте их в избранное
          </p>
        </div>

        <FilterPanel
          selectedSubjects={selectedSubjects}
          selectedGrades={selectedGrades}
          selectedScales={selectedScales}
          onSubjectsChange={setSelectedSubjects}
          onGradesChange={setSelectedGrades}
          onScalesChange={setSelectedScales}
          showOnlySelected={showOnlySelected}
          onShowOnlySelectedChange={setShowOnlySelected}
          selectedCount={selectedCount}
          showDateRange
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {filteredOlympiads.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOlympiads.map((olympiad) => (
              <OlympiadCard
                key={olympiad.id}
                olympiad={olympiad}
                isSelected={isSelected(olympiad.id)}
                onToggleSelect={toggleSelected}
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
