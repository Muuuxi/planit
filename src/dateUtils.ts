const DAY_MS = 86_400_000;

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const mondayOffset = (result.getDay() + 6) % 7;
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() - mondayOffset);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const year = end.getFullYear();

  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}, ${year}`;
  }

  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
}

export function formatDayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function dateKey(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS);
}
