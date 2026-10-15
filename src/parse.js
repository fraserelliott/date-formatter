/** @typedef {import("./types.js").ParsedDateFormat} ParsedDateFormat */

function splitWeekdayPrefix(format) {
  // Weekday intended → must be valid
  if (format.startsWith("W")) {
    const match = format.match(/^(W+)(\W+)(.+)$/);
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
    dateFormat: format,
  };
}

function assertConsistentSeparators(format, allowNone = false) {
  const normalised = format.toUpperCase().trim();

  const seps = normalised.match(/\W+/g) ?? [];

  if (seps.length === 0) {
    if (allowNone) return null;
    throw new Error("Invalid format: missing separator.");
  }

  const first = seps[0];

  if (!seps.every((s) => s === first)) {
    throw new Error("Invalid format: inconsistent separators.");
  }

  return first;
}

function countStartsWith(sections, letter) {
  return sections.filter((s) => s.startsWith(letter)).length;
}

export function parseFormatString(format) {
  const hasDate = /[WDMY]/.test(format);
  const hasTime = /[Hhmsa]/.test(format);

  if (hasDate && hasTime) {
    const sections = format.split(/\s+(?=[Hhmsa])/);

    if (sections.length !== 2) {
      throw new Error("Invalid combined date/time format.");
    }

    return {
      date: parseDateFormatString(sections[0]),
      time: parseTimeFormatString(sections[1]),
    };
  }

  if (hasDate) {
    return { date: parseDateFormatString(format) };
  }

  if (hasTime) {
    return { time: parseTimeFormatString(format) };
  }

  throw new Error("Invalid format string.");
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

  if (sections.some((s) => !/^(W{3,4}|D{1,2}|M{1,4}|Y{2,4})$/.test(s))) {
    throw new Error("Invalid date format: unexpected token.");
  }

  // reject duplicate tokens
  if (countStartsWith(sections, "D") !== 1)
    throw new Error("Expected exactly one day token (D or DD).");
  if (countStartsWith(sections, "M") !== 1)
    throw new Error("Expected exactly one month token (M/MM/MMM/MMMM).");
  if (countStartsWith(sections, "Y") !== 1)
    throw new Error("Expected exactly one year token (YY or YYYY).");

  // infer order, e.g. DMY, MDY, YMD
  const order = sections.map((s) => s.charAt(0)).join("");

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

export function parseTimeFormatString(format) {
  const separator = assertConsistentSeparators(format, true);
  const sections = separator ? format.split(separator) : [format];

  if (sections.some((s) => !/^(h{1,2}|m{1,2}|s{1,2})$/.test(s)))
    throw new Error("Invalid time format: unexpected token.");

  if (countStartsWith(sections, "h") > 1)
    throw new Error("Expected at most one hour token (h or hh).");
  if (countStartsWith(sections, "m") > 1)
    throw new Error("Expected at most one minute token (m or mm).");
  if (countStartsWith(sections, "s") > 1)
    throw new Error("Expected at most one second token (s or ss).");

  const hourDisplay = formatSection(sections, "hour", "h");
  const minuteDisplay = formatSection(sections, "minute", "m");
  const secondDisplay = formatSection(sections, "second", "s");
  const order = sections.map((s) => s.charAt(0)).join("");

  return {
    order,
    hourDisplay,
    minuteDisplay,
    secondDisplay,
    separator,
    formatString: format,
  };
}

function formatSection(sections, sectionName, letter) {
  const token = sections.find((s) => s.startsWith(letter));
  if (token === undefined) return {};
  if (token.length === 1 || token.length === 2) return { length: token.length };
  throw new Error(`Invalid length of ${sectionName} token`);
}
