
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BankHoliday, OptimizedPlan } from '@/types';
import { optimizeHolidayPlan, OptimizeHolidayPlanInput } from '@/ai/flows/optimize-holiday-plan';
import { Button } from '@/components/ui/button';
import { OptimizedPlanCard } from './OptimizedPlanCard';
import { Wand2, Loader2, AlertTriangle, Info, CalendarDays } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchBankHolidaysForYear } from '@/lib/holidays';

interface HolidayOptimizerClientProps {
  initialBankHolidays: BankHoliday[];
}

const AVAILABLE_DAYS = 25;
const MIN_HOLIDAY_DURATION = 5;
const MAX_HOLIDAY_DURATION = 10;
const SLOVAKIA_COUNTRY_CODE = 'SK';
const SLOVAKIA_COUNTRY_NAME = 'Slovakia';

export function HolidayOptimizerClient({ initialBankHolidays }: HolidayOptimizerClientProps) {
  const [bankHolidays, setBankHolidays] = useState<BankHoliday[]>(initialBankHolidays);
  const [optimizedPlans, setOptimizedPlans] = useState<OptimizedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false); // Kept for consistency if initial load fails
  const [error, setError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const loadHolidaysForSlovakia = useCallback(async () => {
    setIsFetchingHolidays(true);
    setError(null);
    setBankHolidays([]);
    try {
      const holidaysCurrentYear = await fetchBankHolidaysForYear(currentYear, SLOVAKIA_COUNTRY_CODE);
      const holidaysNextYear = await fetchBankHolidaysForYear(currentYear + 1, SLOVAKIA_COUNTRY_CODE);
      const allFetchedHolidays = [...holidaysCurrentYear, ...holidaysNextYear];
      if (allFetchedHolidays.length === 0) {
        setError(`No holiday data found for ${SLOVAKIA_COUNTRY_NAME}. Optimization might not be effective.`);
      }
      setBankHolidays(allFetchedHolidays);
    } catch (e) {
      console.error(`Failed to load holidays for ${SLOVAKIA_COUNTRY_CODE}`, e);
      setError(`Could not load holiday data for ${SLOVAKIA_COUNTRY_NAME}. Please try again or refresh the page.`);
      setBankHolidays([]);
    } finally {
      setIsFetchingHolidays(false);
    }
  }, [currentYear]);
  
  useEffect(() => {
    // If initialBankHolidays are empty (e.g., initial fetch in page.tsx failed), try to load them.
    // Or, if they are provided, set them.
    if (initialBankHolidays.length > 0) {
      setBankHolidays(initialBankHolidays);
    } else if (!isFetchingHolidays) {
        // This case handles if initialBankHolidays was empty from the server,
        // possibly due to an error during server-side fetch.
        // We can try fetching again on client or show an error.
        // For now, let's assume if it's empty, it might be an SSR issue, and rely on handleOptimizeHolidays to check.
        // Or directly show error if initial data is critical and missing.
        setError(`Initial bank holiday data for ${SLOVAKIA_COUNTRY_NAME} could not be loaded. Please check your connection or try refreshing the page.`);
        // Optionally, uncomment to attempt client-side fetch if SSR fails:
        // loadHolidaysForSlovakia(); 
    }
  }, [initialBankHolidays, isFetchingHolidays, loadHolidaysForSlovakia]);


  const handleOptimizeHolidays = async () => {
    if (bankHolidays.length === 0 && !isFetchingHolidays) {
        setError(`No holiday data available for ${SLOVAKIA_COUNTRY_NAME}. Cannot optimize. Try refreshing the page.`);
        return;
    }
    setIsLoading(true);
    setError(null);
    setOptimizedPlans([]);

    const bankHolidayDates = bankHolidays.map(h => h.date);

    const input: OptimizeHolidayPlanInput = {
      countryCode: SLOVAKIA_COUNTRY_CODE,
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
        setError('No optimized plans could be generated. The AI might not have found suitable options or there might be no holidays for Slovakia.');
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

  return (
    <div className="space-y-8">
      <Card className="bg-card shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/10 p-6">
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <CalendarDays className="mr-3 h-8 w-8" />
            Plan Your Slovak Getaway
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground pt-2">
            Let our AI assistant find the best holiday periods for you in Slovakia. We maximize your time off by leveraging bank holidays and weekends.
            You have <strong>{AVAILABLE_DAYS}</strong> vacation days. We'll plan for holidays between <strong>{MIN_HOLIDAY_DURATION}</strong> and <strong>{MAX_HOLIDAY_DURATION}</strong> days long.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-end">
            <Button
              onClick={handleOptimizeHolidays}
              disabled={isLoading || isFetchingHolidays || bankHolidays.length === 0}
              size="lg"
              className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-6 w-6" />
              )}
              {isLoading ? 'Optimizing...' : 'Optimize My Slovak Holidays'}
            </Button>
          </div>
           {(isFetchingHolidays || (bankHolidays.length === 0 && !isLoading && !error && !initialBankHolidays.length)) && (
             <Alert variant={isFetchingHolidays ? "default" : "destructive"} className="mt-6 bg-secondary/50 border-secondary">
                {isFetchingHolidays ? <Loader2 className="h-5 w-5 animate-spin text-primary"/> : <AlertTriangle className="h-5 w-5" />}
               <AlertTitle className={isFetchingHolidays ? "text-primary" : ""}>{isFetchingHolidays ? "Loading Holiday Data" : "Missing Data"}</AlertTitle>
               <AlertDescription>
                 {isFetchingHolidays ? `Fetching bank holidays for ${SLOVAKIA_COUNTRY_NAME}...` : `Bank holiday data could not be loaded for ${SLOVAKIA_COUNTRY_NAME}. Optimization is disabled until data is available.`}
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
           <AlertTitle className="text-primary font-semibold">Ready to Plan for Slovakia?</AlertTitle>
           <AlertDescription>
             Click the "Optimize My Slovak Holidays" button to generate your personalized holiday plans. 
             The AI will consider bank holidays for the current ({currentYear}) and next ({currentYear + 1}) year.
           </AlertDescription>
         </Alert>
      )}

      {optimizedPlans.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold font-headline mb-8 text-center text-primary">
            Optimized Holiday Plans for {SLOVAKIA_COUNTRY_NAME}
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
