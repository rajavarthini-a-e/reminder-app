/**
 * Formats a scheduled time string (which may be ISO 8601, military time, or natural time)
 * into a clean, human-friendly display format like "8:00 PM" or "2:30 PM".
 */
export function formatScheduledTime(timeStr?: string | null): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // Already formatted like "8:00 AM", "12:30 PM", "8 PM"
  if (/^\d{1,2}(:\d{2})?\s*[AP]M$/i.test(trimmed)) {
    return trimmed;
  }

  // Simple 24hr format like "14:30" or "09:15"
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    const [hours, minutes] = trimmed.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // Try parsing ISO date or standard date string
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  } catch (err) {
    // ignore
  }

  return trimmed;
}
