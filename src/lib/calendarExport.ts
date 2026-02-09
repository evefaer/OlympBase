import { Olympiad } from "@/data/olympiads";

/**
 * Formats a date string (YYYY-MM-DD) to Google Calendar format (YYYYMMDD)
 */
function toGoogleDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/**
 * For all-day events, Google Calendar needs the end date to be the NEXT day
 */
function toGoogleEndDate(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Generate a Google Calendar event creation URL
 */
export function getGoogleCalendarUrl(olympiad: Olympiad): string {
  const params = new URLSearchParams();
  params.set("action", "TEMPLATE");
  params.set("text", olympiad.title);
  params.set("dates", `${toGoogleDate(olympiad.startDate)}/${toGoogleEndDate(olympiad.endDate)}`);

  const details = [
    olympiad.description,
    `Предмет: ${olympiad.subject}`,
    `Масштаб: ${olympiad.scale}`,
    `Классы: ${olympiad.grades.join(", ")}`,
    olympiad.format ? `Формат: ${olympiad.format}` : "",
    olympiad.organizer ? `Организатор: ${olympiad.organizer}` : "",
    olympiad.website ? `Сайт: ${olympiad.website}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  params.set("details", details);

  if (olympiad.website) {
    params.set("sprop", `website:${olympiad.website}`);
  }

  return `https://calendar.google.com/calendar/event?${params.toString()}`;
}

/**
 * Generate an .ics file content for any calendar app
 */
export function generateIcsContent(olympiad: Olympiad): string {
  const uid = `${olympiad.id}@olimpbase`;
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = toGoogleDate(olympiad.startDate);
  const end = toGoogleEndDate(olympiad.endDate);

  const description = [
    olympiad.description,
    `Предмет: ${olympiad.subject}`,
    `Масштаб: ${olympiad.scale}`,
    `Классы: ${olympiad.grades.join(", ")}`,
    olympiad.format ? `Формат: ${olympiad.format}` : "",
    olympiad.organizer ? `Организатор: ${olympiad.organizer}` : "",
    olympiad.website ? `Сайт: ${olympiad.website}` : "",
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OlimpBase//RU",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${olympiad.title}`,
    `DESCRIPTION:${description}`,
    olympiad.website ? `URL:${olympiad.website}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/**
 * Download an .ics file for the given olympiad
 */
export function downloadIcsFile(olympiad: Olympiad) {
  const content = generateIcsContent(olympiad);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${olympiad.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, "_")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
