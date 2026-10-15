# Date Format Spec Utility

A small, spec-driven date and time formatting utility for JavaScript.

This library formats dates and times using **constrained, documented format strings** designed for settings-driven usage (e.g. user preferences, locale presets), not free-text parsing.

The goal is predictability, clarity, and ease of extension — not maximum flexibility.

---

## Installation

```bash
npm install @fraserelliott/date-formatter
```

---

## Basic Usage

```js
import {
  formatDate,
  formatTime,
  formatDateTime,
} from "@fraserelliott/date-formatter";

const date = new Date(2026, 9, 15, 17, 5, 9);

formatDate(date, "DD/MM/YYYY");
// → "15/10/2026"

formatTime(date, "hh:mm:ss");
// → "17:05:09"

formatDateTime(date, "WWW DD-MMM-YYYY hh:mm");
// → "Thu 15-Oct-2026 17:05"
```

### Parsing and Formatting Requirements

`parseFormatString()` is a universal parser that accepts date-only, time-only, and combined date/time formats.

Alternatively, you can use the specialised parsing functions:

- `parseDateFormatString()` accepts date-only formats.
- `parseTimeFormatString()` accepts time-only formats.

Formatting functions require the parsed configuration to contain the sections needed for their output:

- `formatDate()` requires a date section.
- `formatTime()` requires a time section.
- `formatDateTime()` requires both sections.

A parsed format can therefore be valid even if it is not suitable for a particular formatting function. Attempting to format a missing section throws an error.

### Reusing Parsed Formats

Format strings can be parsed once and reused, avoiding repeated parsing when formatting multiple values.

```js
import {
  parseDateFormatString,
  parseTimeFormatString,
  parseFormatString,
  formatDate,
  formatTime,
  formatDateTime,
} from "@fraserelliott/date-formatter";

const dateFormat = parseDateFormatString("DD/MM/YYYY");
const timeFormat = parseTimeFormatString("hh:mm:ss");
const combinedFormat = parseFormatString("WWW DD-MMM-YYYY hh:mm");

formatDate(new Date(), dateFormat);
formatTime(new Date(), timeFormat);
formatDateTime(new Date(), combinedFormat);
```

A combined format object can also be passed to the individual formatting functions:

```js
formatDate(new Date(), combinedFormat);
formatTime(new Date(), combinedFormat);
```

Each function uses only the relevant section of the parsed format.

---

## Format String Specification

Format strings describe **what to render**, not how to guess intent.

Invalid formats throw errors.

### General Rules

- Date tokens use `D`, `M`, `Y`, and optionally `W`.
- Time tokens use `h`, `m`, and `s`.
- Date formats require a day, month, and year.
- Time formats may contain any combination of supported time tokens.
- Tokens may appear in different orders.
- Separators must be consistent within each date or time portion.
- Combined date/time formats separate the date and time portions with whitespace.

The date and time portions may use different separators.

For example:

```txt
WWW DD-MMM-YYYY hh:mm:ss
DD/MM/YYYY hh:mm
YYYY-MM-DD hh.mm.ss
```

---

## Date Formatting

Date formatting retains the original library specification and API.

### Weekday Prefix (Optional)

If present, the weekday **must appear at the start** of the date format.

| Token | Meaning |
|---|---|
| `WWW` | Short weekday name (`Mon`, `Fri`) |
| `WWWW` | Long weekday name (`Monday`, `Friday`) |

Rules:

- If the date format starts with `W`, it must be a valid weekday token.
- The weekday token must be followed by a separator.
- The weekday separator may differ from the separator used between date tokens.
- Invalid weekday tokens throw an error.

Examples:

```txt
WWW DD.MM.YYYY
WWWW - DD - MM - YYYY
```

### Date Tokens (Mandatory)

A date format **must include exactly one** day, month, and year token.

#### Day

| Token | Meaning |
|---|---|
| `D` | Day of month (numeric) |
| `DD` | Day of month, zero-padded |

#### Month

| Token | Meaning |
|---|---|
| `M` | Month number |
| `MM` | Month number, zero-padded |
| `MMM` | Short month name (`Jan`) |
| `MMMM` | Long month name (`January`) |

#### Year

| Token | Meaning |
|---|---|
| `YY` | Two-digit year |
| `YYYY` | Four-digit year |

### Date Examples

```js
const date = new Date(2026, 9, 15);

formatDate(date, "DD/MM/YYYY");
// → "15/10/2026"

formatDate(date, "MM-DD-YYYY");
// → "10-15-2026"

formatDate(date, "DD - MMM - YY");
// → "15 - Oct - 26"

formatDate(date, "WWW DD.MM.YYYY");
// → "Thu 15.10.2026"

formatDate(date, "WWWW DD MMMM YYYY");
// → "Thursday 15 October 2026"
```

---

## Time Formatting

Time formatting uses a 24-hour clock.

Unlike date formats, **all time components are optional**. A format may contain hours, minutes, seconds, or any combination of them.

### Time Tokens

| Token | Meaning |
|---|---|
| `h` | Hour (0–23) |
| `hh` | Hour, zero-padded (00–23) |
| `m` | Minute (0–59) |
| `mm` | Minute, zero-padded (00–59) |
| `s` | Second (0–59) |
| `ss` | Second, zero-padded (00–59) |

Rules:

- Each component may appear at most once.
- Each token must be one or two characters long.
- Tokens may appear in any order.
- A single-token format does not require a separator.
- No AM/PM or 12-hour clock tokens are currently supported.

### Time Examples

```js
const date = new Date(2026, 9, 15, 17, 5, 9);

formatTime(date, "hh:mm");
// → "17:05"

formatTime(date, "hh:mm:ss");
// → "17:05:09"

formatTime(date, "h:m:s");
// → "17:5:9"

formatTime(date, "mm:ss");
// → "05:09"

formatTime(date, "ss");
// → "09"

formatTime(date, "hh.mm.ss");
// → "17.05.09"

formatTime(date, "ss:mm:hh");
// → "09:05:17"
```

Time formatting represents the **time of day** associated with a JavaScript `Date`, not an elapsed duration or stopwatch value.

---

## Combined Date and Time Formatting

Use `formatDateTime()` to format both a date and its time in one operation.

A combined format consists of:

1. A valid date format.
2. Whitespace separating the date and time portions.
3. A valid time format.

For example:

```js
const date = new Date(2026, 9, 15, 17, 5, 9);

formatDateTime(date, "DD/MM/YYYY hh:mm");
// → "15/10/2026 17:05"

formatDateTime(date, "WWW DD-MMM-YYYY hh:mm:ss");
// → "Thu 15-Oct-2026 17:05:09"

formatDateTime(date, "D/M/YY h:m");
// → "15/10/26 17:5"
```

### Using Combined Parsed Formats

`parseFormatString()` produces a structured object containing the date and/or time formatting configuration.

```js
const format = parseFormatString("DD/MM/YYYY hh:mm");
```

The resulting object has the following general structure:

```js
{
  date: {
    order: "DMY",
    // Date formatting options
  },
  time: {
    order: "hm",
    // Time formatting options
  }
}
```

The same parsed object can be used with all three formatting functions:

```js
formatDate(date, format);
// → "15/10/2026"

formatTime(date, format);
// → "17:05"

formatDateTime(date, format);
// → "15/10/2026 17:05"
```

For custom output between the date and time, compose the individual functions:

```js
`${formatDate(date, format)} | ${formatTime(date, format)}`;
// → "15/10/2026 | 17:05"
```

---

## Separators

A separator consists of **one or more non-word characters** (`\W+`).

Multi-character separators are supported.

The same separator must be used consistently between tokens within each date or time portion.

Valid examples:

```txt
DD/MM/YYYY
DD - MM - YYYY
DD.MM.YYYY
hh:mm:ss
hh :) mm :) ss
DD/MM/YYYY hh:mm:ss
```

Invalid examples:

```txt
DD-MM / YYYY
DD_MM_YYYY
hh:mm.ss
```

Underscores are not supported as separators because JavaScript's `\w` character class includes `_`.

Date and time portions are validated independently, so a combined format can use `/` for dates and `:` for times.

---

## Date Inputs and Timezones

All formatting functions accept:

- JavaScript `Date` objects
- Date strings
- Numeric timestamps

### Date-Only Strings

ISO date-only strings (`YYYY-MM-DD`) are interpreted as **local dates at midnight**.

```js
formatDateTime("2026-10-15", "DD/MM/YYYY hh:mm");
// → "15/10/2026 00:00"
```

This avoids timezone-related date shifts when formatting values that represent calendar dates rather than specific instants.

### Date and Time Strings

ISO timestamps are interpreted using JavaScript's standard `Date` behaviour.

```js
// In the UK during British Summer Time:

formatDateTime(
  "2026-10-15T17:05:09Z",
  "DD/MM/YYYY hh:mm:ss"
);
// → "15/10/2026 18:05:09"

formatDateTime(
  "2026-10-15T17:05:09",
  "DD/MM/YYYY hh:mm:ss"
);
// → "15/10/2026 17:05:09"
```

A timestamp ending in `Z` represents UTC, while a timestamp without a timezone offset is interpreted as local time.

Formatting uses the runtime's local timezone. The library does not provide custom timezone selection.

---

## API

### `parseDateFormatString(format: string)`

Parses and validates a date-only format string.

Returns a structured, flat date format object suitable for reuse.

The original API and object structure are preserved for backwards compatibility.

### `parseTimeFormatString(format: string)`

Parses and validates a time-only format string.

Returns a structured time format object suitable for reuse.

### `parseFormatString(format: string)`

General-purpose parser for date, time, and combined date/time format strings.

Accepts any valid format containing a date section, a time section, or both. Returns a structured object containing whichever sections are present.

This can be used as the primary parsing function without needing to choose between `parseDateFormatString()` and `parseTimeFormatString()`.

### `formatDate(date, format)`

Formats the date portion of a value.

- `date`: `Date | string | number`
- `format`: date format string, parsed date format object, or combined format object

Returns a formatted string.

### `formatTime(date, format)`

Formats the time portion of a value.

- `date`: `Date | string | number`
- `format`: time format string, parsed time format object, or combined format object

Returns a formatted string.

### `formatDateTime(date, format)`

Formats the date and time portions of a value.

- `date`: `Date | string | number`
- `format`: combined format string or parsed combined format object

Returns a formatted string.

All parsing and formatting functions throw errors for invalid or unsupported format configurations.

---

## Errors

The library intentionally throws errors for invalid format strings.

Examples include:

- Invalid or duplicate weekday tokens
- Missing mandatory date tokens
- Duplicate date or time tokens
- Unsupported token lengths
- Unknown time tokens
- Missing or inconsistent separators
- Missing required date or time formatting options

For example:

```js
formatTime(new Date(), "hh:mm.ss");
// Error: Invalid format: inconsistent separators.

formatTime(new Date(), "hh:mm:hh");
// Error: Expected at most one hour token (h or hh).

formatDate(new Date(), "DD/YYYY");
// Error: Expected exactly one month token (M/MM/MMM/MMMM).
```

Format strings are intended to be validated when configuring a format, rather than repeatedly reconstructed during rendering.

---

## Non-Goals

This library does **not** aim to:

- Parse arbitrary user-entered date/time expressions
- Guess intent from ambiguous strings
- Provide timezone conversion or timezone-selection tokens
- Format elapsed durations or stopwatch values
- Support 12-hour clock or AM/PM formatting
- Replicate spreadsheet or locale-magic formatting

---

## Future Directions

Possible future extensions include:

- Optional or partial date formats
- Custom padding rules
- Locale-aware month and weekday output
- 12-hour clock and AM/PM tokens
- Millisecond precision

The specification is intentionally small and predictable.

---

## License

MIT