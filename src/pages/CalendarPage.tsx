import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { FilterPanel } from "@/components/FilterPanel";
import { CalendarView } from "@/components/CalendarView";
import { useSelectedOlympiads } from "@/hooks/useSelectedOlympiads";
import { olympiadsData, Subject, Grade, Scale } from "@/data/olympiads";

const CalendarPage = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);
  const [selectedScales, setSelectedScales] = useState<Scale[]>([]);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const { isSelected, toggleSelected, selectedCount } = useSelectedOlympiads();

  const filteredOlympiads = useMemo(() => {
    return olympiadsData.filter((olympiad) => {
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

      return true;
    });
  }, [selectedSubjects, selectedGrades, selectedScales, showOnlySelected, isSelected]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Календарь олимпиад
          </h1>
          <p className="text-muted-foreground">
            Планируйте участие в олимпиадах и не пропускайте важные даты
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
        />

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
      </main>
    </div>
  );
};

export default CalendarPage;
