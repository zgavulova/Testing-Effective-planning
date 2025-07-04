import type { BankHoliday } from '@/types';

const API_BASE_URL = 'https://date.nager.at/api/v3';

export async function fetchBankHolidaysForYear(year: number, countryCode: string): Promise<BankHoliday[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/PublicHolidays/${year}/${countryCode}`);
    if (!response.ok) {
      console.error(`Failed to fetch holidays for ${year} (${countryCode}): ${response.statusText}`);
      return [];
    }
    const holidays: BankHoliday[] = await response.json();
    return holidays;
  } catch (error) {
    console.error(`Error fetching holidays for ${year} (${countryCode}):`, error);
    return [];
  }
}
