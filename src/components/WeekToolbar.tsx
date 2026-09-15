import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDayDate, formatWeekRange } from "../dateUtils";
import type { ViewMode } from "../types";

interface WeekToolbarProps {
  weekStart: Date;
  selectedDate: Date;
  mode: ViewMode;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onModeChange: (mode: ViewMode) => void;
}

export function WeekToolbar({
  weekStart,
  selectedDate,
  mode,
  onPrevious,
  onNext,
  onToday,
  onModeChange,
}: WeekToolbarProps) {
  const rangeLabel = mode === "week" ? formatWeekRange(weekStart) : formatDayDate(selectedDate);

  return (
    <header className="week-toolbar">
      <div className="week-heading">
        <p className="eyebrow">Weekly calendar</p>
        <div className="week-navigation">
          <button
            className="icon-button"
            type="button"
            onClick={onPrevious}
            aria-label={`Previous ${mode}`}
          >
            <ChevronLeft size={18} />
          </button>
          <h1>{rangeLabel}</h1>
          <button
            className="icon-button"
            type="button"
            onClick={onNext}
            aria-label={`Next ${mode}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="toolbar-actions">
        <button className="today-button" type="button" onClick={onToday}>Today</button>
        <div className="segmented-control" aria-label="Calendar view">
          <button
            className={mode === "week" ? "selected" : ""}
            type="button"
            aria-pressed={mode === "week"}
            onClick={() => onModeChange("week")}
          >
            Week
          </button>
          <button
            className={mode === "day" ? "selected" : ""}
            type="button"
            aria-pressed={mode === "day"}
            onClick={() => onModeChange("day")}
          >
            Day
          </button>
        </div>
      </div>
    </header>
  );
}
