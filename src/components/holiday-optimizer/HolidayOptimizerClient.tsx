
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HolidayOptimizerClientProps {
  initialBankHolidays: BankHoliday[];
  initialDefaultYear: number;
}

const AVAILABLE_DAYS = 25;
const MIN_HOLIDAY_DURATION = 5;
const MAX_HOLIDAY_DURATION = 10;
const SLOVAKIA_COUNTRY_CODE = 'SK';
const SLOVAKIA_COUNTRY_NAME = 'Slovakia';

const NUM_YEARS_IN_DROPDOWN = 6; // e.g., 2025 to 2030 if initialDefaultYear is 2025

export function HolidayOptimizerClient({ initialBankHolidays, initialDefaultYear }: HolidayOptimizerClientProps) {
  const [selectedYear, setSelectedYear] = useState<number>(initialDefaultYear);
  const [bankHolidays, setBankHolidays] = useState<BankHoliday[]>(initialBankHolidays);
  const [optimizedPlans, setOptimizedPlans] = useState<OptimizedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableYears = Array.from({ length: NUM_YEARS_IN_DROPDOWN }, (_, i) => initialDefaultYear + i);

  const fetchAndSetHolidays = useCallback(async (yearToFetch: number) => {
    setIsFetchingHolidays(true);
    setError(null);
    setOptimizedPlans([]);
    setBankHolidays([]); // Clear current holidays before fetching new ones

    try {
      const holidaysCurrent = await fetchBankHolidaysForYear(yearToFetch, SLOVAKIA_COUNTRY_CODE);
      const holidaysNext = await fetchBankHolidaysForYear(yearToFetch + 1, SLOVAKIA_COUNTRY_CODE);
      const allFetchedHolidays = [...holidaysCurrent, ...holidaysNext];

      if (allFetchedHolidays.length === 0) {
        setError(`No holiday data found for ${SLOVAKIA_COUNTRY_NAME} for ${yearToFetch}-${yearToFetch + 1}. Optimization might not be effective.`);
      }
      setBankHolidays(allFetchedHolidays);
    } catch (e) {
      console.error(`Failed to load holidays for ${yearToFetch}-${yearToFetch + 1} (${SLOVAKIA_COUNTRY_CODE})`, e);
      setError(`Could not load holiday data for ${SLOVAKIA_COUNTRY_NAME} (${yearToFetch}-${yearToFetch + 1}). Please try again.`);
      setBankHolidays([]);
    } finally {
      setIsFetchingHolidays(false);
    }
  }, []);

  useEffect(() => {
    if (selectedYear !== initialDefaultYear) {
      fetchAndSetHolidays(selectedYear);
    } else {
      // Selected year is the default year, use initial data.
      setBankHolidays(initialBankHolidays);
      setIsFetchingHolidays(false); // Ensure fetching is false
      // Clear plans if they were for a different year, otherwise keep them if they were for initialDefaultYear
      // For simplicity, we can clear plans when switching back to default year if they are not from initial load.
      // This is tricky; handleOptimizeHolidays will generate new ones correctly.
      // Let's ensure error state is correct:
      if (initialBankHolidays.length === 0 && !isLoading) { 
        setError(`Initial bank holiday data for ${SLOVAKIA_COUNTRY_NAME} for ${initialDefaultYear}-${initialDefaultYear + 1} could not be loaded. Please try selecting a different year or refresh.`);
        setOptimizedPlans([]);
      } else if (initialBankHolidays.length > 0 && error) {
        // If we have initial holidays and there was an error from a previous fetch, clear it
        setError(null);
      }
    }
  }, [selectedYear, initialDefaultYear, initialBankHolidays, fetchAndSetHolidays, isLoading, error]);


  const handleYearChange = (yearValue: string) => {
    const yearNumber = parseInt(yearValue, 10);
    if (yearNumber !== selectedYear) {
      setSelectedYear(yearNumber);
      setOptimizedPlans([]); // Clear plans when year changes
    }
  };

  const handleOptimizeHolidays = async () => {
    if (bankHolidays.length === 0 && !isFetchingHolidays) {
        setError(`No holiday data available for ${SLOVAKIA_COUNTRY_NAME} for ${selectedYear}-${selectedYear+1}. Cannot optimize. Try a different year or refresh.`);
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
        setError(`No optimized plans could be generated for ${selectedYear}-${selectedYear+1}. The AI might not have found suitable options, or there might be insufficient holiday data for Slovakia in this period.`);
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
            Let our AI assistant find the best holiday periods for you in Slovakia for {selectedYear} and {selectedYear + 1}. We maximize your time off by leveraging bank holidays and weekends.
            You have <strong>{AVAILABLE_DAYS}</strong> vacation days. We'll plan for holidays between <strong>{MIN_HOLIDAY_DURATION}</strong> and <strong>{MAX_HOLIDAY_DURATION}</strong> days long.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="year-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Base Year for Planning</Label>
            <Select onValueChange={handleYearChange} defaultValue={String(selectedYear)}>
              <SelectTrigger id="year-select" className="w-full md:w-72">
                <SelectValue placeholder="Select year..." />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={String(year)}>
                    {year} (Plans will cover {year} & {year + 1})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              The AI will consider bank holidays for {selectedYear} and {selectedYear + 1}.
            </p>
          </div>

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
              {isLoading ? 'Optimizing...' : `Optimize Holidays for ${selectedYear}`}
            </Button>
          </div>
           {(isFetchingHolidays || (bankHolidays.length === 0 && !isLoading && !error && initialBankHolidays.length === 0 && selectedYear === initialDefaultYear) ) && (
             <Alert variant={isFetchingHolidays ? "default" : "destructive"} className="mt-6 bg-secondary/50 border-secondary">
                {isFetchingHolidays ? <Loader2 className="h-5 w-5 animate-spin text-primary"/> : <AlertTriangle className="h-5 w-5" />}
               <AlertTitle className={isFetchingHolidays ? "text-primary" : ""}>{isFetchingHolidays ? "Loading Holiday Data" : "Missing Data"}</AlertTitle>
               <AlertDescription>
                 {isFetchingHolidays ? `Fetching bank holidays for ${SLOVAKIA_COUNTRY_NAME} ${selectedYear}-${selectedYear+1}...` : `Bank holiday data for ${selectedYear}-${selectedYear+1} could not be loaded. Optimization is disabled until data is available.`}
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
             Click the "Optimize Holidays for {selectedYear}" button to generate your personalized holiday plans. 
             The AI will consider bank holidays for {selectedYear} and {selectedYear + 1}.
           </AlertDescription>
         </Alert>
      )}

      {optimizedPlans.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold font-headline mb-8 text-center text-primary">
            Optimized Holiday Plans for {SLOVAKIA_COUNTRY_NAME} ({selectedYear} - {selectedYear + 1})
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
