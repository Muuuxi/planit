import type {
  CalendarEvent,
  DailyCapacity,
  Deadline,
  Priority,
} from "./types";

export const calendarEvents: CalendarEvent[] = [
  { id: "e01", title: "Weekly planning", day: 0, start: "08:00", end: "08:45", category: "focus", detail: "Set the week" },
  { id: "e02", title: "Product research sync", day: 0, start: "10:00", end: "11:00", category: "meeting", detail: "Zoom · Research team" },
  { id: "e03", title: "Strategy studio", day: 0, start: "13:00", end: "14:30", category: "class", detail: "Gross Hall 107" },
  { id: "e04", title: "Portfolio deep work", day: 0, start: "16:00", end: "17:30", category: "focus", detail: "Protected focus" },
  { id: "e05", title: "Morning run", day: 1, start: "07:30", end: "08:15", category: "personal", detail: "Easy pace" },
  { id: "e06", title: "User interviews", day: 1, start: "09:30", end: "11:00", category: "meeting", detail: "3 participant sessions" },
  { id: "e07", title: "AIPI 590", day: 1, start: "13:30", end: "16:00", category: "class", detail: "AI Product Management" },
  { id: "e08", title: "Project synthesis", day: 1, start: "17:00", end: "18:15", category: "focus", detail: "Interview themes" },
  { id: "e09", title: "Case study writing", day: 2, start: "08:30", end: "10:30", category: "focus", detail: "No meetings" },
  { id: "e10", title: "Team working session", day: 2, start: "11:00", end: "12:15", category: "meeting", detail: "Link in Notion" },
  { id: "e11", title: "Lunch with Maya", day: 2, start: "12:30", end: "13:30", category: "personal", detail: "West Union" },
  { id: "e12", title: "Faculty office hours", day: 2, start: "15:00", end: "16:00", category: "class", detail: "Teer 203" },
  { id: "e13", title: "Competitive review", day: 3, start: "09:00", end: "10:30", category: "focus", detail: "Calendar products" },
  { id: "e14", title: "Prototype critique", day: 3, start: "11:00", end: "12:00", category: "meeting", detail: "Design team" },
  { id: "e15", title: "AIPI 590", day: 3, start: "13:40", end: "16:25", category: "class", detail: "Hudson Hall 207" },
  { id: "e16", title: "Team retrospective", day: 3, start: "17:00", end: "18:00", category: "meeting", detail: "Weekly closeout" },
  { id: "e17", title: "Assignment polish", day: 4, start: "08:30", end: "10:30", category: "focus", detail: "Final visual pass" },
  { id: "e18", title: "Portfolio review", day: 4, start: "11:00", end: "12:00", category: "meeting", detail: "Peer feedback" },
  { id: "e19", title: "AIPI brief due", day: 4, start: "15:00", end: "15:45", category: "deadline", detail: "Submit on Canvas" },
  { id: "e20", title: "Weekly reflection", day: 4, start: "16:30", end: "17:15", category: "focus", detail: "Notes + next actions" },
  { id: "e21", title: "Long run", day: 5, start: "09:00", end: "10:15", category: "personal", detail: "Duke Forest" },
  { id: "e22", title: "Life admin", day: 5, start: "11:30", end: "12:30", category: "personal", detail: "Errands + groceries" },
  { id: "e23", title: "Reading block", day: 5, start: "15:00", end: "16:30", category: "focus", detail: "Product strategy" },
  { id: "e24", title: "Slow morning", day: 6, start: "09:30", end: "10:30", category: "personal", detail: "Protected time" },
  { id: "e25", title: "Prepare next week", day: 6, start: "16:00", end: "17:00", category: "focus", detail: "Review commitments" },
];

export const deadlines: Deadline[] = [
  { id: "d01", title: "Research synthesis", day: 2, time: "5:00 PM", project: "Planit" },
  { id: "d02", title: "AIPI product brief", day: 4, time: "3:00 PM", project: "AIPI 590" },
  { id: "d03", title: "Portfolio case study", day: 6, time: "8:00 PM", project: "Portfolio" },
];

export const priorities: Priority[] = [
  { id: "p01", title: "Complete product brief", project: "AIPI 590", day: 4 },
  { id: "p02", title: "Synthesize interview notes", project: "Planit", day: 2 },
  { id: "p03", title: "Polish portfolio narrative", project: "Portfolio", day: 5 },
];

export const dailyCapacity: DailyCapacity[] = [
  { day: 0, bookedHours: 5.0, availableHours: 7.5 },
  { day: 1, bookedHours: 6.4, availableHours: 7.5 },
  { day: 2, bookedHours: 5.8, availableHours: 7.5 },
  { day: 3, bookedHours: 6.2, availableHours: 7.5 },
  { day: 4, bookedHours: 4.4, availableHours: 7.5 },
  { day: 5, bookedHours: 3.0, availableHours: 6.5 },
  { day: 6, bookedHours: 2.0, availableHours: 6.5 },
];
