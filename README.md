# Date Format Spec Utility

A small, spec-driven date formatting utility for JavaScript.

This library formats dates using a **constrained, documented format string** designed for
settings-driven usage (e.g. user preferences, locale presets), not free-text parsing.

The goal is predictability, clarity, and ease of extension — not maximum flexibility.

---

## Installation

```bash
npm install @fraserelliott/date-formatter
```

---

## Basic Usage

```js
import { formatDate } from "@fraserelliott/date-formatter";

formatDate(new Date("2026-01-30"), "DD/MM/YYYY");
// → "30/01/2026"

formatDate(new Date("2026-01-30"), "WWW DD.MM.YYYY");
// → "Fri 30.01.2026"
```

You can also parse a format once and reuse it:

```js
import {
  parseDateFormatString,
  formatDate,
} from "@fraserelliott/date-formatter";

const parsed = parseDateFormatString("WWWW DD MMM YYYY");
formatDate(new Date(), parsed);
```

---

## Format String Spec (v1)

Format strings describe **what to render**, not how to guess intent.
Invalid formats throw errors.

### General Rules

- Format strings are **case-insensitive**
- A format consists of:
  - an optional **weekday prefix**
  - followed by a **date format**

- All separators are **one or more non-word characters** (`\W+`)
- Separators must be **consistent** within the date portion

---

### Weekday Prefix (Optional)

If present, the weekday **must appear at the start** of the format string.

| Token  | Meaning                                |
| ------ | -------------------------------------- |
| `WWW`  | Short weekday name (`Mon`, `Fri`)      |
| `WWWW` | Long weekday name (`Monday`, `Friday`) |

Rules:

- If the string starts with `W`, it **must** be a valid weekday token
- The weekday token **must** be followed by a separator, this can be different to the separator used between the date tokens
- Invalid weekday tokens throw an error

Examples:

```txt
WWW DD.MM.YYYY
WWWW - DD - MM - YYYY
```

---

### Date Tokens (Mandatory)

The date portion **must include exactly one** day, month, and year token.

#### Day

| Token | Meaning                   |
| ----- | ------------------------- |
| `D`   | Day of month (numeric)    |
| `DD`  | Day of month, zero-padded |

#### Month

| Token  | Meaning                     |
| ------ | --------------------------- |
| `M`    | Month number                |
| `MM`   | Month number, zero-padded   |
| `MMM`  | Short month name (`Jan`)    |
| `MMMM` | Long month name (`January`) |

#### Year

| Token  | Meaning         |
| ------ | --------------- |
| `YY`   | Two-digit year  |
| `YYYY` | Four-digit year |

---

### Separators

- A separator is defined as **one or more non-word characters** (`\W+`)
- Multi-character separators are supported
- The same separator must be used consistently between date tokens

Valid examples:

```txt
DD/MM/YYYY
DD - MM - YYYY
DD.MM.YYYY
```

Invalid examples:

```txt
DD-MM / YYYY
DD_MM_YYYY
```

---

## Examples

```js
formatDate(new Date("2026-01-30"), "DD/MM/YYYY");
// 30/01/2026

formatDate(new Date("2026-01-30"), "DD - MMM - YY");
// 30 - Jan - 26

formatDate(new Date("2026-01-30"), "WWW DD.MM.YYYY");
// Fri 30.01.2026

formatDate(new Date("2026-01-30"), "WWWW DD MMMM YYYY");
// Friday 30 January 2026
```

---

## Errors

This library **throws errors** for invalid format strings, including:

- Invalid weekday tokens (`W`, `WW`)
- Weekday tokens not followed by a separator
- Missing day, month, or year tokens
- Unsupported token lengths
- Inconsistent or missing separators

This is intentional: format strings are treated as **configuration**, not user input.

---

## API

### `parseDateFormatString(format: string)`

Parses and validates a format string.

Returns a structured format object suitable for reuse.

Throws on invalid formats.

---

### `formatDate(date, format)`

Formats a date.

- `date`: `Date | string | number`
- `format`: format string or parsed format object

Returns a formatted string.

---

## Non-Goals

This library does **not** aim to:

- Parse arbitrary user-entered date formats
- Guess intent from ambiguous strings
- Support time or timezone tokens
- Replicate spreadsheet or locale-magic formatting

---

## Future Directions

Possible future extensions (not yet implemented):

- Allow optional/missing date tokens
- Custom padding rules
- Locale-aware month/weekday output
- Time formatting

The current spec is intentionally small and strict.

---

## License

MIT
