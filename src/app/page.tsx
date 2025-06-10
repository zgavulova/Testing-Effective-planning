import { HolidayOptimizerClient } from '@/components/holiday-optimizer/HolidayOptimizerClient';
import { fetchBankHolidaysForYear } from '@/lib/holidays';
import type { BankHoliday } from '@/types';
import { AppHeader } from '@/components/layout/AppHeader';
import Image from 'next/image';

// Function to determine the current season
const getSeason = (): { name: string; hint: string } => {
  const month = new Date().getMonth(); // 0 (Jan) - 11 (Dec)
  if (month >= 2 && month <= 4) return { name: 'spring', hint: 'spring blossom' }; // Mar, Apr, May
  if (month >= 5 && month <= 7) return { name: 'summer', hint: 'summer beach' }; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return { name: 'autumn', hint: 'autumn leaves' }; // Sep, Oct, Nov
  return { name: 'winter', hint: 'winter snow' }; // Dec, Jan, Feb
};

export default async function HomePage() {
  const currentYear = new Date().getFullYear();
  const season = getSeason();
  
  // Default to Slovakia (SK) for initial load, country can be changed in client
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
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={`https://placehold.co/1200x400.png`}
            alt={`${season.name} scene`}
            width={1200}
            height={400}
            className="w-full object-cover"
            data-ai-hint={season.hint}
          />
        </div>
        <HolidayOptimizerClient initialBankHolidays={allHolidays} initialCountryCode={defaultCountryCode} />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        Effective Holiday planning &copy; {currentYear}
      </footer>
    </div>
  );
}
