/**
 * @typedef {{ type: "none" } | { type: "short" | "long", separator: string }} WeekdayDisplay
 * @typedef {{ type: "numeric", length: 1 | 2 }} DayDisplay
 * @typedef {{ type: "numeric", length: 1 | 2 } | { type: "short" | "long" }} MonthDisplay
 * @typedef {{ length: 2 | 4 }} YearDisplay
 *
 * @typedef {Object} ParsedDateFormat
 * @property {string} order
 * @property {string} separator
 * @property {WeekdayDisplay} weekdayDisplay
 * @property {DayDisplay} dayDisplay
 * @property {MonthDisplay} monthDisplay
 * @property {YearDisplay} yearDisplay
 */
