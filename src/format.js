/** @typedef {import("./types.js").ParsedDateFormat} ParsedDateFormat */

/**
 * @param {Date | string | number} date
 * @param {string | ParsedDateFormat} format
 */
export function formatDate(date, format) {
  // If a format string was provided, infer the structure
  if (typeof format === "string") {
    const parsed = parseDateFormatString(format);
    return formatDate(date, parsed);
  }

  const d = new Date(date);

  const {
    order,
    separator,
    weekdayDisplay = { type: "none" },
    dayDisplay = { length: 2 },
    monthDisplay = { type: "numeric", length: 2 },
    yearDisplay = { length: 4 },
  } = format;

  // Get string values for each section and then join with the provided format
  const day = String(d.getDate()).padStart(dayDisplay.length, "0");
  const month =
    monthDisplay.type === "numeric"
      ? String(d.getMonth() + 1).padStart(monthDisplay.length, "0")
      : d.toLocaleString("en-GB", { month: monthDisplay.type });
  const year =
    yearDisplay.length === 4
      ? String(d.getFullYear())
      : String(d.getFullYear()).substring(2);

  const parts = { D: day, M: month, Y: year };
  const ordered = order.split("").map((k) => parts[k]);
  const dateStr = ordered.join(separator);

  if (weekdayDisplay.type === "none") return dateStr;

  const weekday = d.toLocaleString("en-GB", { weekday: weekdayDisplay.type });
  return weekday + weekdayDisplay.separator + dateStr;
}
