export type CalendarCategory =
  | "class"
  | "focus"
  | "meeting"
  | "personal"
  | "deadline";

export type ViewMode = "week" | "day";

export interface CalendarEvent {
  id: string;
  title: string;
  day: number;
  start: string;
  end: string;
  category: CalendarCategory;
  detail?: string;
}

export interface Deadline {
  id: string;
  title: string;
  day: number;
  time: string;
  project: string;
}

export interface Priority {
  id: string;
  title: string;
  project: string;
  day: number;
}

export interface DailyCapacity {
  day: number;
  bookedHours: number;
  availableHours: number;
}

export type CommitmentPriority = "Critical" | "High" | "Medium" | "Low";
export type CommitmentFlexibility = "Fixed" | "Flexible";
export type CommitmentEnergy = "High" | "Medium" | "Low";

export interface ExtractedCommitment {
  id: string;
  title: string;
  schedule: string;
  category: string;
  priority: CommitmentPriority;
  flexibility: CommitmentFlexibility;
  energy: CommitmentEnergy;
}
