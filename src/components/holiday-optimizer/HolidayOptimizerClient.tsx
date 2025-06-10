
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BankHoliday, OptimizedPlan } from '@/types';
import { optimizeHolidayPlan, OptimizeHolidayPlanInput } from '@/ai/flows/optimize-holiday-plan';
import { Button } from '@/components/ui/button';
import { OptimizedPlanCard } from './OptimizedPlanCard';
import { Wand2, Loader2, AlertTriangle, Info, CalendarDays } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchBankHolidaysForYear } from '@/lib/holidays';

interface HolidayOptimizerClientProps {
  initialBankHolidays: BankHoliday[];
  initialCountryCode: string;
}

const AVAILABLE_DAYS = 25;
const MIN_HOLIDAY_DURATION = 5;
const MAX_HOLIDAY_DURATION = 10;

// List of European countries - can be expanded
const europeanCountries = [
  { code: 'SK', name: 'Slovakia' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'PL', name: 'Poland' },
  { code: 'HU', name: 'Hungary' },
  { code: 'AT', name: 'Austria' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'GB', name: 'United Kingdom' },
  // Add more countries as needed
];

export function HolidayOptimizerClient({ initialBankHolidays, initialCountryCode }: HolidayOptimizerClientProps) {
  const [bankHolidays, setBankHolidays] = useState<BankHoliday[]>(initialBankHolidays);
  const [optimizedPlans, setOptimizedPlans] = useState<OptimizedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountryCode);
  const currentYear = new Date().getFullYear();

  const loadHolidaysForCountry = useCallback(async (countryCode: string) => {
    setIsFetchingHolidays(true);
    setError(null);
    setBankHolidays([]); // Clear previous holidays
    try {
      const holidaysCurrentYear = await fetchBankHolidaysForYear(currentYear, countryCode);
      const holidaysNextYear = await fetchBankHolidaysForYear(currentYear + 1, countryCode);
      const allFetchedHolidays = [...holidaysCurrentYear, ...holidaysNextYear];
      if (allFetchedHolidays.length === 0) {
        setError(`No holiday data found for ${europeanCountries.find(c => c.code === countryCode)?.name || countryCode}. Optimization might not be effective.`);
      }
      setBankHolidays(allFetchedHolidays);
    } catch (e) {
      console.error(`Failed to load holidays for ${countryCode}`, e);
      setError(`Could not load holiday data for ${europeanCountries.find(c => c.code === countryCode)?.name || countryCode}. Please try again or select a different country.`);
      setBankHolidays([]);
    } finally {
      setIsFetchingHolidays(false);
    }
  }, [currentYear]);
  
  useEffect(() => {
    if (selectedCountry !== initialCountryCode) { // Avoid re-fetching initial data
        loadHolidaysForCountry(selectedCountry);
    } else if (initialBankHolidays.length === 0 && !isFetchingHolidays && selectedCountry === initialCountryCode) { // Check for initial load specifically
         setError(`Could not load initial bank holiday data for ${europeanCountries.find(c => c.code === selectedCountry)?.name || selectedCountry}. Please check your connection or try refreshing the page.`);
    }
  }, [selectedCountry, loadHolidaysForCountry, initialCountryCode, initialBankHolidays, isFetchingHolidays]);


  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setOptimizedPlans([]); // Clear plans when country changes
  };

  const handleOptimizeHolidays = async () => {
    if (bankHolidays.length === 0 && !isFetchingHolidays) {
        setError(`No holiday data available for ${europeanCountries.find(c => c.code === selectedCountry)?.name || selectedCountry}. Cannot optimize.`);
        return;
    }
    setIsLoading(true);
    setError(null);
    setOptimizedPlans([]);

    const bankHolidayDates = bankHolidays.map(h => h.date);

    const input: OptimizeHolidayPlanInput = {
      countryCode: selectedCountry,
      bankHolidays: bankHolidayDates,
      availableDays: AVAILABLE_DAYS,
      minHolidayDuration: MIN_HOLIDAY_DURATION,
      maxHolidayDuration: MAX_HOLIDAY_DURATION,
    };

    try {
      const result = await optimizeHolidayPlan(input);
      if (result && result.optimizedPlans && result.optimizedPlans.length > 0) {
        setOptimizedPlans(result.optimizedPlans);
      } else {
        setError('No optimized plans could be generated. The AI might not have found suitable options or there might be no holidays for the selected country.');
      }
    } catch (e) {
      console.error('Error optimizing holiday plan:', e);
      let errorMessage = 'An error occurred while optimizing holiday plans. Please try again.';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCountryName = europeanCountries.find(c => c.code === selectedCountry)?.name || selectedCountry;

  return (
    <div className="space-y-8">
      <Card className="bg-card shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/10 p-6">
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <CalendarDays className="mr-3 h-8 w-8" />
            Plan Your Perfect Getaway
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground pt-2">
            Select a country, and let our AI assistant find the best holiday periods for you. We maximize your time off by leveraging bank holidays and weekends.
            You have <strong>{AVAILABLE_DAYS}</strong> vacation days. We'll plan for holidays between <strong>{MIN_HOLIDAY_DURATION}</strong> and <strong>{MAX_HOLIDAY_DURATION}</strong> days long for {selectedCountryName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6 items-end">
            <div>
              <label htmlFor="country-select" className="block text-sm font-medium text-foreground mb-1">Select Country:</label>
              <Select onValueChange={handleCountryChange} defaultValue={selectedCountry} disabled={isLoading || isFetchingHolidays}>
                <SelectTrigger id="country-select" className="w-full md:w-[250px] text-base py-2.5">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {europeanCountries.map(country => (
                    <SelectItem key={country.code} value={country.code} className="text-base py-2">
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleOptimizeHolidays}
              disabled={isLoading || isFetchingHolidays || bankHolidays.length === 0}
              size="lg"
              className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 self-end"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-6 w-6" />
              )}
              {isLoading ? 'Optimizing...' : 'Optimize My Holidays'}
            </Button>
          </div>
           {(isFetchingHolidays || (bankHolidays.length === 0 && !isLoading && !error)) && (
             <Alert variant={isFetchingHolidays ? "default" : "destructive"} className="mt-6 bg-secondary/50 border-secondary">
                {isFetchingHolidays ? <Loader2 className="h-5 w-5 animate-spin text-primary"/> : <AlertTriangle className="h-5 w-5" />}
               <AlertTitle className={isFetchingHolidays ? "text-primary" : ""}>{isFetchingHolidays ? "Loading Holiday Data" : "Missing Data"}</AlertTitle>
               <AlertDescription>
                 {isFetchingHolidays ? `Fetching bank holidays for ${selectedCountryName}...` : `Bank holiday data could not be loaded for ${selectedCountryName}. Optimization is disabled until data is available.`}
               </AlertDescription>
             </Alert>
           )}
        </CardContent>
      </Card>

      {error && !isFetchingHolidays && (
        <Alert variant="destructive" className="shadow-md rounded-lg">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isFetchingHolidays && optimizedPlans.length === 0 && !error && bankHolidays.length > 0 && (
         <Alert className="border-primary/50 bg-primary/5 shadow-md rounded-lg">
           <Info className="h-5 w-5 text-primary" />
           <AlertTitle className="text-primary font-semibold">Ready to Plan?</AlertTitle>
           <AlertDescription>
             Click the "Optimize My Holidays" button to generate your personalized holiday plans for {selectedCountryName}. 
             The AI will consider bank holidays for the current ({currentYear}) and next ({currentYear + 1}) year.
           </AlertDescription>
         </Alert>
      )}

      {optimizedPlans.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold font-headline mb-8 text-center text-primary">
            Optimized Holiday Plans for {selectedCountryName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {optimizedPlans.map((plan, index) => (
              <OptimizedPlanCard key={index} plan={plan} allBankHolidays={bankHolidays} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
