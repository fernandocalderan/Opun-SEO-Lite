const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("es", {
  numeric: "auto",
});

const TIME_SEGMENTS: Array<{
  unit: Intl.RelativeTimeFormatUnit;
  ms: number;
}> = [
  { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
  { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
  { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
  { unit: "day", ms: 1000 * 60 * 60 * 24 },
  { unit: "hour", ms: 1000 * 60 * 60 },
  { unit: "minute", ms: 1000 * 60 },
  { unit: "second", ms: 1000 },
];

export function formatRelativeTimeFromNow(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  const now = Date.now();
  const diffMs = date.getTime() - now;

  for (const segment of TIME_SEGMENTS) {
    const magnitude = Math.round(diffMs / segment.ms);
    if (Math.abs(magnitude) >= 1 || segment.unit === "second") {
      return RELATIVE_TIME_FORMATTER.format(magnitude, segment.unit);
    }
  }

  return RELATIVE_TIME_FORMATTER.format(0, "second");
}
