/** @typedef {import("./types.js").ParsedDateFormat} ParsedDateFormat */

function splitWeekdayPrefix(format) {
  const normalised = format.toUpperCase();

  // Weekday intended → must be valid
  if (normalised.startsWith("W")) {
    const match = normalised.match(/^(W+)(\W+)(.+)$/);
    if (!match) {
      throw new Error(
        'Invalid weekday prefix. Use "WWW" or "WWWW" followed by a separator.',
      );
    }

    const [, wToken, separator, dateFormat] = match;

    if (wToken.length === 3) {
      return { weekdayDisplay: { type: "short", separator }, dateFormat };
    }

    if (wToken.length === 4) {
      return { weekdayDisplay: { type: "long", separator }, dateFormat };
    }

    throw new Error('Invalid weekday token length. Use "WWW" or "WWWW".');
  }

  // No weekday intended
  return {
    weekdayDisplay: { type: "none" },
    dateFormat: normalised,
  };
}

function assertConsistentSeparators(dateFormat) {
  const normalised = dateFormat.toUpperCase();

  // Capture separators only when they occur between letter tokens.
  const seps = [...normalised.matchAll(/[A-Z]+(\W+)[A-Z]+/g)].map((m) => m[1]);

  if (seps.length === 0) {
    throw new Error("Invalid date format: missing separator.");
  }

  const first = seps[0];
  if (!seps.every((s) => s === first)) {
    throw new Error(
      `Invalid date format: inconsistent separators (${seps.map(JSON.stringify).join(", ")}).`,
    );
  }

  return first;
}

function countStartsWith(sections, letter) {
  return sections.filter((s) => s.startsWith(letter)).length;
}

/**
 * @param {string} format
 * @returns {ParsedDateFormat}
 */
export function parseDateFormatString(format) {
  const { weekdayDisplay, dateFormat } = splitWeekdayPrefix(format);

  const separator = assertConsistentSeparators(dateFormat);

  // split into sections (DD, MMM, YYYY, etc.)
  const sections = dateFormat.split(separator);

  // reject duplicate tokens
  if (countStartsWith(sections, "D") !== 1)
    throw new Error("Expected exactly one day token (D or DD).");
  if (countStartsWith(sections, "M") !== 1)
    throw new Error("Expected exactly one month token (M/MM/MMM/MMMM).");
  if (countStartsWith(sections, "Y") !== 1)
    throw new Error("Expected exactly one year token (YY or YYYY).");

  // infer order, e.g. DMY, MDY, YMD
  const order = sections.map((s) => s.charAt(0).toUpperCase()).join("");

  // valid day tokens: D, DD
  const dayDisplay = {};
  const dayToken = sections.find((s) => s.startsWith("D"));
  if (dayToken?.length === 1 || dayToken?.length === 2)
    dayDisplay.length = dayToken.length;
  else throw new Error("Invalid length of day token.");

  // valid month tokens: M, MM, MMM, MMMM
  const monthDisplay = {};
  const monthToken = sections.find((s) => s.startsWith("M"));
  if (monthToken?.length === 1 || monthToken?.length === 2) {
    monthDisplay.type = "numeric";
    monthDisplay.length = monthToken.length;
  } else if (monthToken?.length === 3) monthDisplay.type = "short";
  else if (monthToken?.length === 4) monthDisplay.type = "long";
  else throw new Error("Invalid length of month token.");

  // valid year tokens: YY, YYYY
  const yearDisplay = {};
  const yearToken = sections.find((s) => s.startsWith("Y"));
  if (yearToken?.length === 2 || yearToken?.length === 4)
    yearDisplay.length = yearToken.length;
  else throw new Error("Invalid length of year token.");

  return {
    order,
    weekdayDisplay,
    dayDisplay,
    monthDisplay,
    yearDisplay,
    separator,
    formatString: format,
  };
}
