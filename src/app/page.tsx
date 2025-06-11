import { HolidayOptimizerClient } from '@/components/holiday-optimizer/HolidayOptimizerClient';
import { fetchBankHolidaysForYear } from '@/lib/holidays';
import type { BankHoliday } from '@/types';
import { AppHeader } from '@/components/layout/AppHeader';

const SLOVAKIA_COUNTRY_CODE = 'SK';
const DEFAULT_OPTIMIZER_YEAR = 2025;

export default async function HomePage() {
  let initialHolidays: BankHoliday[] = [];

  try {
    const holidaysSelectedYear = await fetchBankHolidaysForYear(DEFAULT_OPTIMIZER_YEAR, SLOVAKIA_COUNTRY_CODE);
    const holidaysNextSelectedYear = await fetchBankHolidaysForYear(DEFAULT_OPTIMIZER_YEAR + 1, SLOVAKIA_COUNTRY_CODE);
    initialHolidays = [...holidaysSelectedYear, ...holidaysNextSelectedYear];
  } catch (e) {
    console.error(`Failed to load initial holidays for ${DEFAULT_OPTIMIZER_YEAR}-${DEFAULT_OPTIMIZER_YEAR + 1} (${SLOVAKIA_COUNTRY_CODE}) on server:`, e);
    // initialHolidays will remain empty, client will show an error or attempt to fetch.
  }
  
  const currentDisplayYear = new Date().getFullYear(); // For footer

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <HolidayOptimizerClient 
          initialBankHolidays={initialHolidays}
          initialDefaultYear={DEFAULT_OPTIMIZER_YEAR} 
        />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        Effective Slovak Holiday planning &copy; {currentDisplayYear}
      </footer>
    </div>
  );
}
