import { HolidayOptimizerClient } from '@/components/holiday-optimizer/HolidayOptimizerClient';
import { fetchBankHolidaysForYear } from '@/lib/slovak-holidays';
import type { BankHoliday } from '@/types';
import { AppHeader } from '@/components/layout/AppHeader';

export default async function HomePage() {
  const currentYear = new Date().getFullYear();
  // Fetch for current and next year to give more optimization options
  let holidaysCurrentYear: BankHoliday[] = [];
  let holidaysNextYear: BankHoliday[] = [];

  try {
    holidaysCurrentYear = await fetchBankHolidaysForYear(currentYear);
  } catch (e) {
    console.error(`Failed to load holidays for ${currentYear}`, e);
    // holidaysCurrentYear remains empty
  }
  
  try {
    holidaysNextYear = await fetchBankHolidaysForYear(currentYear + 1);
  } catch (e) {
    console.error(`Failed to load holidays for ${currentYear + 1}`, e);
    // holidaysNextYear remains empty
  }
  
  const allHolidays: BankHoliday[] = [...holidaysCurrentYear, ...holidaysNextYear];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <HolidayOptimizerClient initialBankHolidays={allHolidays} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        Slovak Holiday Optimizer &copy; {currentYear}
      </footer>
    </div>
  );
}
