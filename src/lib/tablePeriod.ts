const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const MONTHS_EN = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const MONTH_TO_INDEX: Record<string, number> = {
  ...Object.fromEntries(MONTHS_ES.map((month, index) => [month, index])),
  ...Object.fromEntries(MONTHS_EN.map((month, index) => [month, index])),
};

interface TableLike {
  id: string;
  name: string;
}

interface TablePeriod {
  month: number;
  year: number;
}

const parseTablePeriod = (tableName: string): TablePeriod | null => {
  const normalized = tableName.trim().toLowerCase();
  const parts = normalized.split(/\s+/);
  if (parts.length < 2) return null;

  const monthName = parts[0];
  const year = Number.parseInt(parts[parts.length - 1], 10);
  const month = MONTH_TO_INDEX[monthName];

  if (month === undefined || Number.isNaN(year)) return null;
  return { month, year };
};

const getPreviousPeriod = ({ month, year }: TablePeriod): TablePeriod => {
  if (month === 0) {
    return { month: 11, year: year - 1 };
  }

  return { month: month - 1, year };
};

export const findPreviousCalendarTable = <T extends TableLike>(
  tables: T[],
  currentTableName: string,
): T | undefined => {
  const period = parseTablePeriod(currentTableName);
  if (!period) return undefined;

  const previousPeriod = getPreviousPeriod(period);

  return tables.find((table) => {
    const tablePeriod = parseTablePeriod(table.name);
    if (!tablePeriod) return false;

    return (
      tablePeriod.month === previousPeriod.month &&
      tablePeriod.year === previousPeriod.year
    );
  });
};
