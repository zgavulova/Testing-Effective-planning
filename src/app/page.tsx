import { HolidayOptimizerClient } from '@/components/holiday-optimizer/HolidayOptimizerClient';
import { fetchBankHolidaysForYear } from '@/lib/holidays';
import type { BankHoliday } from '@/types';
import { AppHeader } from '@/components/layout/AppHeader';

const SLOVAKIA_COUNTRY_CODE = 'SK';

export default async function HomePage() {
  const currentYear = new Date().getFullYear();
  
  let holidaysCurrentYear: BankHoliday[] = [];
  let holidaysNextYear: BankHoliday[] = [];

  try {
    holidaysCurrentYear = await fetchBankHolidaysForYear(currentYear, SLOVAKIA_COUNTRY_CODE);
  } catch (e) {
    console.error(`Failed to load holidays for ${currentYear} (${SLOVAKIA_COUNTRY_CODE})`, e);
  }
  
  try {
    holidaysNextYear = await fetchBankHolidaysForYear(currentYear + 1, SLOVAKIA_COUNTRY_CODE);
  } catch (e) {
    console.error(`Failed to load holidays for ${currentYear + 1} (${SLOVAKIA_COUNTRY_CODE})`, e);
  }
  
  const allHolidays: BankHoliday[] = [...holidaysCurrentYear, ...holidaysNextYear];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <HolidayOptimizerClient initialBankHolidays={allHolidays} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        Effective Slovak Holiday planning &copy; {currentYear}
      </footer>
    </div>
  );
}
