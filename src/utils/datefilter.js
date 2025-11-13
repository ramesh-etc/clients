
export const getDateRange = (range, options = {}) => {
  const today = new Date();
  const WEEK_DURATION_DAYS = options.weekDurationDays ?? 6;

  const toISODate = (date) => date.toISOString().split('T')[0];

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday as start
    d.setDate(d.getDate() + diff);
    return d;
  };

  const getEndOfWeek = (startOfWeek) => {
    const end = new Date(startOfWeek);
    end.setDate(end.getDate() + WEEK_DURATION_DAYS);
    return end;
  };

  const getMonthRange = (offset = 0) => {
    const year = today.getFullYear();
    const month = today.getMonth() + offset;
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return [start, end];
  };

  let startDate, endDate;

  switch (range) {
    case 'this_week': {
      const start = getStartOfWeek(today);
      const end = getEndOfWeek(start);
      [startDate, endDate] = [toISODate(start), toISODate(end)];
      break;
    }
    case 'last_week': {
      const start = getStartOfWeek(today);
      start.setDate(start.getDate() - 7);
      const end = getEndOfWeek(start);
      [startDate, endDate] = [toISODate(start), toISODate(end)];
      break;
    }
    case 'next_week': {
      const start = getStartOfWeek(today);
      start.setDate(start.getDate() + 7);
      const end = getEndOfWeek(start);
      [startDate, endDate] = [toISODate(start), toISODate(end)];
      break;
    }
    case 'this_month': {
      const [start, end] = getMonthRange(0);
      [startDate, endDate] = [toISODate(start), toISODate(end)];
      break;
    }
    case 'last_month': {
      const [start, end] = getMonthRange(-1);
      [startDate, endDate] = [toISODate(start), toISODate(end)];
      break;
    }
    case 'next_month': {
      const [start, end] = getMonthRange(1);
      [startDate, endDate] = [toISODate(start), toISODate(end)];
      break;
    }
    case 'custom': {
      const { startDate: customStart = "", endDate: customEnd = "" } = options;
      [startDate, endDate] = [customStart, customEnd];
      break;
    }
    default:
      [startDate, endDate] = ["", ""];
  }

  return { startDate, endDate };
};
