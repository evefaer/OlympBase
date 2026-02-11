import { Skeleton } from "@/components/ui/skeleton";

export function CalendarSkeleton() {
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="bg-card rounded-xl border border-border p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="w-9 h-9 rounded-lg" />
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid — 5 rows */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[60px] sm:min-h-[100px] md:min-h-[120px] rounded-lg p-1 sm:p-2 md:p-3">
            <Skeleton className="h-4 w-4 mb-2" />
            {i % 5 === 0 && <Skeleton className="h-2.5 w-2.5 rounded-full" />}
            {i % 7 === 2 && (
              <div className="flex gap-1 mt-1">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
        <Skeleton className="h-4 w-20 mb-2" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Skeleton className="w-2.5 h-2.5 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
