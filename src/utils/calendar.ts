/**
 * Utilities for generating calendar events for World Cup 2026 matches.
 * Custom implementation supporting Google Calendar and universal iCalendar (.ics) formats.
 */

import { Match, Team } from "../types";

/**
 * Parses match date (dd/mm/yyyy) and time (hh:mm) to a UTC Date object,
 * assuming the match time is in Argentina (ARG) time zone (UTC-3).
 * To convert ARG (UTC-3) to UTC, we add 3 hours.
 */
export function getMatchUTCDate(match: Match): Date {
  try {
    const dateParts = match.date.split("/");
    if (dateParts.length < 3) {
      throw new Error("Invalid date format. Expected dd/mm/yyyy");
    }
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // JS Month is 0-indexed
    const year = parseInt(dateParts[2], 10);

    const timeParts = match.time.split(":");
    if (timeParts.length < 2) {
      throw new Error("Invalid time format. Expected hh:mm");
    }
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    // Create a Date object treating inputs as UTC first, then adjust offset manually.
    // Base match is hours (in ARG) + 3 to get UTC.
    const utcHoursValue = hours + 3;

    return new Date(Date.UTC(year, month, day, utcHoursValue, minutes, 0));
  } catch (error) {
    console.error("Error parsing match date-time for calendar:", error);
    // Fallback to a safe default if parsing fails
    return new Date();
  }
}

/**
 * Formats a Date object to the standard iCalendar date-time string in UTC.
 * Format: YYYYMMDDTHHMMSSZ (e.g., 20260611T190000Z)
 */
function formatToUTCString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

/**
 * Helper to get clean display/title names
 */
function getMatchDetails(match: Match, teams: Team[]) {
  const local = teams.find(t => t.id === match.localId);
  const visitor = teams.find(t => t.id === match.visitorId);

  const localName = local ? `${local.bandera} ${local.name}` : match.localId;
  const visitorName = visitor ? `${visitor.bandera} ${visitor.name}` : match.visitorId;

  const isCupGroup = match.group.length === 1;
  const phaseLabel = isCupGroup ? `Grupo ${match.group}` : `Fase ${match.group}`;

  const title = `Mundial 2026: ${localName} vs. ${visitorName}`;
  const description = `Partido #${match.id} del Mundial de Fútbol 2026.\n\n` +
    `Fase: ${phaseLabel}\n` +
    `Estadio: ${match.venueName}\n` +
    `Transmisión: ${match.tv.join(", ")}\n\n` +
    `¡Disfruta del partido!`;

  return { title, description, location: match.venueName };
}

/**
 * Generates a direct Google Calendar web render URL for the match.
 */
export function getGoogleCalendarUrl(match: Match, teams: Team[]): string {
  const { title, description, location } = getMatchDetails(match, teams);
  
  const startDate = getMatchUTCDate(match);
  // Match lasts 2 hours (120 minutes)
  const endDate = new Date(startDate.getTime() + 120 * 60 * 1000);

  const startStr = formatToUTCString(startDate);
  const endStr = formatToUTCString(endDate);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startStr}/${endStr}`,
    details: description,
    location: location,
    sf: "true"
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and triggers download of a .ics file in the browser for the match.
 */
export function downloadICSFile(match: Match, teams: Team[]): void {
  const { title, description, location } = getMatchDetails(match, teams);

  const startDate = getMatchUTCDate(match);
  const endDate = new Date(startDate.getTime() + 120 * 60 * 1000);

  const now = new Date();

  const formattedStart = formatToUTCString(startDate);
  const formattedEnd = formatToUTCString(endDate);
  const formattedStamp = formatToUTCString(now);

  // Escaping special characters in iCalendar text fields
  const escapeText = (str: string) => {
    return str
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mundial 2026 App//NONSGML v1.0//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:match-${match.id}@mundial2026.app`,
    `DTSTAMP:${formattedStamp}`,
    `DTSTART:${formattedStart}`,
    `DTEND:${formattedEnd}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const icsContent = icsLines.join("\r\n");

  try {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `mundial2026_partido_${match.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating .ics file download:", error);
  }
}
