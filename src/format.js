/** @typedef {import("./types.js").ParsedDateFormat} ParsedDateFormat */

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
    const parsed = parseDateFormatString(format);
    return formatDate(date, parsed);
  }

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
