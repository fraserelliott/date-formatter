import {
  parseTimeFormatString,
  parseDateFormatString,
  parseFormatString,
} from "./parse.js";

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function toDate(dateLike) {
  if (dateLike instanceof Date) return dateLike;

  if (typeof dateLike === "string") {
    const m = ISO_DATE_RE.exec(dateLike);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      return new Date(y, mo - 1, d); // LOCAL date, no timezone shift
    }
  }

  return new Date(dateLike); // numbers/timestamps, other strings, etc.
}

/**
 * @param {Date | string | number} date
 * @param {string | ParsedDateFormat} format
 */
export function formatDate(date, format) {
  if (typeof format === "string") {
    const parsed = parseFormatString(format);
    return formatDate(date, parsed);
  }

  if (format.date) return formatDate(date, format.date);

  if (
    !format.order ||
    !format.dayDisplay ||
    !format.monthDisplay ||
    !format.yearDisplay
  )
    throw new Error(
      "Invalid date format: missing required formatting options.",
    );

  const d = toDate(date);

  const {
    order,
    separator,
    weekdayDisplay = { type: "none" },
    dayDisplay = { length: 2 },
    monthDisplay = { type: "numeric", length: 2 },
    yearDisplay = { length: 4 },
  } = format;

  const day = String(d.getDate()).padStart(dayDisplay.length, "0");

  const month =
    monthDisplay.type === "numeric"
      ? String(d.getMonth() + 1).padStart(monthDisplay.length, "0")
      : d.toLocaleString("en-GB", { month: monthDisplay.type });

  const year =
    yearDisplay.length === 4
      ? String(d.getFullYear())
      : String(d.getFullYear()).slice(-2);

  const parts = { D: day, M: month, Y: year };
  const ordered = order.split("").map((k) => parts[k]);
  const dateStr = ordered.join(separator);

  if (weekdayDisplay.type === "none") return dateStr;

  const weekday = d.toLocaleString("en-GB", { weekday: weekdayDisplay.type });
  return weekday + weekdayDisplay.separator + dateStr;
}

export function formatTime(date, format) {
  if (typeof format === "string") {
    const parsed = parseFormatString(format);
    return formatTime(date, parsed);
  }

  if (format.time) return formatTime(date, format.time);

  if (!format.order)
    throw new Error(
      "Invalid time format: missing required formatting options.",
    );

  const d = toDate(date);

  const { order, separator, hourDisplay, minuteDisplay, secondDisplay } =
    format;

  const parts = {
    h: String(d.getHours()).padStart(hourDisplay?.length ?? 1, "0"),
    m: String(d.getMinutes()).padStart(minuteDisplay?.length ?? 1, "0"),
    s: String(d.getSeconds()).padStart(secondDisplay?.length ?? 1, "0"),
  };

  return order
    .split("")
    .map((k) => parts[k])
    .join(separator ?? "");
}

export function formatDateTime(date, format) {
  return `${formatDate(date, format)} ${formatTime(date, format)}`;
}
