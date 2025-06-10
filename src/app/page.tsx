import { HolidayOptimizerClient } from '@/components/holiday-optimizer/HolidayOptimizerClient';
import { fetchBankHolidaysForYear } from '@/lib/holidays';
import type { BankHoliday } from '@/types';
import { AppHeader } from '@/components/layout/AppHeader';

export default async function HomePage() {
  const currentYear = new Date().getFullYear();
  
  const defaultCountryCode = 'SK';
  let holidaysCurrentYear: BankHoliday[] = [];
  let holidaysNextYear: BankHoliday[] = [];

  try {
    holidaysCurrentYear = await fetchBankHolidaysForYear(currentYear, defaultCountryCode);
  } catch (e) {
    console.error(`Failed to load holidays for ${currentYear} (${defaultCountryCode})`, e);
  }
  
  try {
    holidaysNextYear = await fetchBankHolidaysForYear(currentYear + 1, defaultCountryCode);
  } catch (e) {
    console.error(`Failed to load holidays for ${currentYear + 1} (${defaultCountryCode})`, e);
  }
  
  const allHolidays: BankHoliday[] = [...holidaysCurrentYear, ...holidaysNextYear];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <HolidayOptimizerClient initialBankHolidays={allHolidays} initialCountryCode={defaultCountryCode} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        Effective Holiday planning &copy; {currentYear}
      </footer>
    </div>
  );
}
