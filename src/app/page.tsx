
import { HolidayOptimizerClient } from '@/components/holiday-optimizer/HolidayOptimizerClient';
import { fetchBankHolidaysForYear } from '@/lib/holidays';
import type { BankHoliday } from '@/types';

const SLOVAKIA_COUNTRY_CODE = 'SK';
// Use the current year as the default for optimization and initial display
const DEFAULT_OPTIMIZER_YEAR = new Date().getFullYear();

export default async function HomePage() {
  let initialHolidays: BankHoliday[] = [];
  const currentDisplayYear = new Date().getFullYear(); // For footer

  try {
    // Fetch holidays for the default optimizer year and the year after
    const holidaysSelectedYear = await fetchBankHolidaysForYear(DEFAULT_OPTIMIZER_YEAR, SLOVAKIA_COUNTRY_CODE);
    const holidaysNextSelectedYear = await fetchBankHolidaysForYear(DEFAULT_OPTIMIZER_YEAR + 1, SLOVAKIA_COUNTRY_CODE);
    initialHolidays = [...holidaysSelectedYear, ...holidaysNextSelectedYear];
  } catch (e) {
    console.error(`Failed to load initial holidays for ${DEFAULT_OPTIMIZER_YEAR}-${DEFAULT_OPTIMIZER_YEAR + 1} (${SLOVAKIA_COUNTRY_CODE}) on server:`, e);
    // initialHolidays will remain empty, client will show an error or attempt to fetch.
  }
  
  return (
    <HolidayOptimizerClient 
      initialBankHolidays={initialHolidays}
      initialDefaultYear={DEFAULT_OPTIMIZER_YEAR}
      currentDisplayYear={currentDisplayYear}
    />
  );
}

