import {
  formatDate,
  formatTime,
  formatDateTime,
  parseDateFormatString,
  parseTimeFormatString,
  parseFormatString,
} from "../src/index.js";

const date = new Date(2026, 9, 15, 17, 5, 9); // Local time

function runTest(label, fn) {
  console.log(`\n--- ${label} ---`);

  try {
    console.log("Output:", fn());
  } catch (error) {
    console.log("Error:", error.message);
  }
}

function testFormat(formatter, label, date, format) {
  runTest(label, () => {
    console.log("Date:", date);
    console.log("Format:", format);
    return formatter(date, format);
  });
}

console.log("========== DATE FORMAT TESTS ==========");

testFormat(formatDate, "Standard UK date", date, "DD/MM/YYYY");
testFormat(formatDate, "US date", date, "MM-DD-YYYY");
testFormat(
  formatDate,
  "Weekday and abbreviated month",
  date,
  "WWW DD-MMM-YYYY",
);
testFormat(formatDate, "Full month", date, "DD MMMM YYYY");
testFormat(formatDate, "Single-digit tokens", date, "D/M/YY");

console.log("\n========== TIME FORMAT TESTS ==========");

testFormat(formatTime, "Hours and minutes", date, "hh:mm");
testFormat(formatTime, "Hours, minutes and seconds", date, "hh:mm:ss");
testFormat(formatTime, "Unpadded time", date, "h:m:s");
testFormat(formatTime, "Minutes and seconds only", date, "mm:ss");
testFormat(formatTime, "Seconds only", date, "ss");
testFormat(formatTime, "Different separator", date, "hh.mm.ss");

console.log("\n========== DATE + TIME TESTS ==========");

testFormat(formatDateTime, "Standard date and time", date, "DD/MM/YYYY hh:mm");

testFormat(
  formatDateTime,
  "Weekday and time",
  date,
  "WWW DD-MMM-YYYY hh:mm:ss",
);

testFormat(formatDateTime, "Unpadded date and time", date, "D/M/YY h:m");

console.log("\n========== PARSED OBJECT TESTS ==========");

const dateFormat = parseDateFormatString("DD/MM/YYYY");
const timeFormat = parseTimeFormatString("hh:mm:ss");
const combinedFormat = parseFormatString("WWW DD-MMM-YYYY hh:mm");

testFormat(formatDate, "Parsed date object", date, dateFormat);
testFormat(formatTime, "Parsed time object", date, timeFormat);
testFormat(formatDateTime, "Parsed combined object", date, combinedFormat);

testFormat(formatDate, "Date from combined object", date, combinedFormat);
testFormat(formatTime, "Time from combined object", date, combinedFormat);

console.log("\n========== DATE INPUT TESTS ==========");

testFormat(
  formatDateTime,
  "UTC ISO timestamp",
  "2026-10-15T17:05:09Z",
  "DD/MM/YYYY hh:mm:ss",
);

testFormat(
  formatDateTime,
  "Local ISO timestamp",
  "2026-10-15T17:05:09",
  "DD/MM/YYYY hh:mm:ss",
);

testFormat(
  formatDateTime,
  "Date-only string",
  "2026-10-15",
  "DD/MM/YYYY hh:mm:ss",
);

console.log("\n========== EXPECTED ERRORS ==========");

testFormat(
  formatDate,
  "Missing date section",
  date,
  parseFormatString("hh:mm"),
);

testFormat(
  formatTime,
  "Missing time section",
  date,
  parseFormatString("DD/MM/YYYY"),
);

testFormat(formatTime, "Duplicate hour token", date, "hh:mm:hh");
testFormat(formatTime, "Invalid hour length", date, "hhh:mm");
testFormat(formatTime, "Unknown token", date, "hh:xyz:mm");
testFormat(formatTime, "Inconsistent separators", date, "hh:mm.ss");

testFormat(formatDate, "Missing month", date, "DD/YYYY");
testFormat(formatDate, "Duplicate day", date, "DD/MM/DD/YYYY");
testFormat(formatDate, "Invalid year length", date, "DD/MM/YYY");

console.log("\n========== FINISHED ==========");
