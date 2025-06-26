import { eachDayOfInterval, isWeekend, isSameDay, differenceInCalendarDays, parseISO, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { BankHoliday, ManualPlanDetails } from '@/types';

export function calculateDateRangeDetails(range: DateRange, allBankHolidays: BankHoliday[]): ManualPlanDetails | null {
  if (!range.from || !range.to) {
    return null;
  }

  const interval = { start: range.from, end: range.to };
  const allDaysInInterval = eachDayOfInterval(interval);

  const bankHolidayDatesInYear = allBankHolidays.map(h => parseISO(h.date));

  let weekendDays = 0;
  let vacationDays = 0;
  const planBankHolidays: BankHoliday[] = [];

  allDaysInInterval.forEach(day => {
    const isHoliday = bankHolidayDatesInYear.some(bhDate => isSameDay(day, bhDate));
    if (isHoliday) {
      // Find the holiday details to add to the list
      const holidayDetail = allBankHolidays.find(h => h.date === format(day, 'yyyy-MM-dd'));
      if(holidayDetail && !planBankHolidays.some(h => h.date === holidayDetail.date)) {
        planBankHolidays.push(holidayDetail);
      }
    }

    if (isWeekend(day)) {
      weekendDays++;
    } else if (!isHoliday) {
      vacationDays++;
    }
  });

  return {
    startDate: range.from,
    endDate: range.to,
    totalDays: differenceInCalendarDays(range.to, range.from) + 1,
    vacationDays: vacationDays,
    weekendDays: weekendDays,
    bankHolidays: planBankHolidays.length,
    bankHolidayNames: planBankHolidays.map(h => h.localName),
  };
}
