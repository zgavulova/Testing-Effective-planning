import type { BankHoliday } from '@/types';

const API_BASE_URL = 'https://date.nager.at/api/v3';

/**
 * Fetches bank holidays for a given year and country code.
 * @param year The year to fetch holidays for.
 * @param countryCode The ISO 3166-1 alpha-2 country code (e.g., SK, DE, FR).
 * @returns A promise that resolves to an array of BankHoliday objects.
 */
export async function fetchBankHolidaysForYear(year: number, countryCode: string): Promise<BankHoliday[]> {
  if (!countryCode) {
    console.error('Country code is required to fetch bank holidays.');
    return [];
  }
  try {
    // The API might take a moment, especially if it's the first request for that country/year.
    // Set a reasonable timeout for the fetch request if needed, or rely on default browser timeout.
    const response = await fetch(`${API_BASE_URL}/PublicHolidays/${year}/${countryCode.toUpperCase()}`);
    
    if (!response.ok) {
      // Log more details for debugging
      const errorBody = await response.text();
      console.error(`Failed to fetch holidays for ${year} (${countryCode}): ${response.status} ${response.statusText}. Body: ${errorBody}`);
      // Attempt to parse error if JSON, otherwise return empty or throw specific error
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson && errorJson.status === 404) { // Nager API returns 404 for invalid country or no holidays
          console.warn(`No holidays found or invalid country for ${countryCode} in ${year}.`);
          return [];
        }
      } catch (parseError) {
        // Not a JSON error response, stick to original error
      }
      return []; // Return empty array on failure to allow graceful degradation
    }
    const holidays: BankHoliday[] = await response.json();
    return holidays;
  } catch (error) {
    console.error(`Network or other error fetching holidays for ${year} (${countryCode}):`, error);
    return []; // Return empty array on network errors
  }
}
