
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BankHoliday, OptimizedPlan } from '@/types';
import { optimizeHolidayPlan, OptimizeHolidayPlanInput } from '@/ai/flows/optimize-holiday-plan';
import { Button } from '@/components/ui/button';
import { OptimizedPlanCard } from './OptimizedPlanCard';
import { Wand2, Loader2, AlertTriangle, Info, CalendarDays, CheckSquare, ListTodo } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchBankHolidaysForYear } from '@/lib/holidays';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DateRange } from 'react-day-picker';
import { parseISO } from 'date-fns';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';

interface HolidayOptimizerClientProps {
  initialBankHolidays: BankHoliday[];
  initialDefaultYear: number;
  currentDisplayYear: number;
}

const AVAILABLE_DAYS = 25;
const SLOVAKIA_COUNTRY_CODE = 'SK';
const SLOVAKIA_COUNTRY_NAME = 'Slovakia';

const NUM_YEARS_IN_DROPDOWN = 6; // Show current year + next 5 years
const DURATION_OPTIONS = [3, 5, 7, 10, 14];
const DEFAULT_DURATION = 5;

export function HolidayOptimizerClient({ initialBankHolidays, initialDefaultYear, currentDisplayYear }: HolidayOptimizerClientProps) {
  const [selectedYear, setSelectedYear] = useState<number>(initialDefaultYear);
  const [selectedHolidayDuration, setSelectedHolidayDuration] = useState<number>(DEFAULT_DURATION);
  const [bankHolidays, setBankHolidays] = useState<BankHoliday[]>(initialBankHolidays);
  const [optimizedPlans, setOptimizedPlans] = useState<OptimizedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSelectedRange, setUserSelectedRange] = useState<DateRange | undefined>();

  const availableYears = Array.from({ length: NUM_YEARS_IN_DROPDOWN }, (_, i) => new Date().getFullYear() + i);

  const fetchAndSetHolidays = useCallback(async (yearToFetch: number) => {
    setIsFetchingHolidays(true);
    setError(null);
    setOptimizedPlans([]);
    setBankHolidays([]); 

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
    if (selectedYear !== initialDefaultYear || initialBankHolidays.length === 0) {
        fetchAndSetHolidays(selectedYear);
    } else {
        setBankHolidays(initialBankHolidays);
        setIsFetchingHolidays(false);
        if (initialBankHolidays.length === 0 && !isFetchingHolidays && !isLoading) {
            setError(`Initial bank holiday data for ${SLOVAKIA_COUNTRY_NAME} for ${initialDefaultYear}-${initialDefaultYear + 1} could not be loaded. Please try selecting a different year or refresh.`);
            setOptimizedPlans([]);
        } else if (initialBankHolidays.length > 0 && error && selectedYear === initialDefaultYear && !isFetchingHolidays && !isLoading) {
            setError(null);
        }
    }
  }, [selectedYear, initialDefaultYear, initialBankHolidays, fetchAndSetHolidays, error, isFetchingHolidays, isLoading]);


  const handleYearChange = (yearValue: string) => {
    const yearNumber = parseInt(yearValue, 10);
    if (yearNumber !== selectedYear) {
      setSelectedYear(yearNumber);
      setOptimizedPlans([]); 
      setUserSelectedRange(undefined); // Reset date range selection when year changes
    }
  };

  const handleDurationChange = (durationValue: string) => {
    setSelectedHolidayDuration(parseInt(durationValue, 10));
    setOptimizedPlans([]); 
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
      minHolidayDuration: selectedHolidayDuration,
      maxHolidayDuration: selectedHolidayDuration,
    };

    try {
      const result = await optimizeHolidayPlan(input);
      if (result && result.optimizedPlans && result.optimizedPlans.length > 0) {
        setOptimizedPlans(result.optimizedPlans);
      } else {
        setError(`No optimized plans could be generated for ${selectedYear}-${selectedYear+1} with a duration of ${selectedHolidayDuration} days. The AI might not have found suitable options, or there might be insufficient holiday data for Slovakia in this period.`);
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

  const totalDaysUsedBySuggestions = optimizedPlans.reduce((sum, plan) => sum + plan.daysUsed, 0);
  const remainingAllowance = AVAILABLE_DAYS - totalDaysUsedBySuggestions;

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        year={selectedYear}
        availableYears={availableYears}
        onYearChange={handleYearChange}
        allBankHolidays={bankHolidays} 
        selectedRange={userSelectedRange}
        onRangeSelect={setUserSelectedRange}
        countryName={SLOVAKIA_COUNTRY_NAME}
      />
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-background">
          <AppHeader />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="space-y-8">
              <Card className="bg-card shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-primary/10 p-6">
                  <CardTitle className="font-headline text-3xl text-primary flex items-center">
                    <CalendarDays className="mr-3 h-8 w-8" />
                    Plan your ideal holiday
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground pt-2 space-y-1">
                    <p>Let our AI assistant find the best holiday periods for you in {SLOVAKIA_COUNTRY_NAME} for {selectedYear} and {selectedYear + 1}. We maximize your time off by leveraging bank holidays and weekends.</p>
                    <p>You have <strong>{AVAILABLE_DAYS}</strong> vacation days.</p>
                    <p>Let's start to plan!</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Base Year for Planning</Label>
                      <Select onValueChange={handleYearChange} value={String(selectedYear)}>
                        <SelectTrigger id="year-select" className="w-full">
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
                    <div>
                      <Label htmlFor="duration-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Holiday Duration</Label>
                      <Select onValueChange={handleDurationChange} defaultValue={String(DEFAULT_DURATION)}>
                        <SelectTrigger id="duration-select" className="w-full">
                          <SelectValue placeholder="Select duration..." />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map(duration => (
                            <SelectItem key={duration} value={String(duration)}>
                              {duration} days
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <p className="text-xs text-muted-foreground mt-1">
                        Desired length of your holiday break.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleOptimizeHolidays}
                      disabled={isLoading || isFetchingHolidays || bankHolidays.length === 0}
                      size="lg"
                      className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-6 w-6" />
                      )}
                      {isLoading ? 'Planning...' : `Plan Holidays for ${selectedYear}`}
                    </Button>
                  </div>
                  {(isFetchingHolidays || (bankHolidays.length === 0 && !isLoading && !error && initialBankHolidays.length === 0 && selectedYear === initialDefaultYear) ) && (
                    <Alert variant={isFetchingHolidays ? "default" : "destructive"} className="mt-6 bg-secondary/50 border-secondary shadow-lg rounded-xl">
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
                <Alert variant="destructive" className="shadow-lg rounded-xl">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!isLoading && !isFetchingHolidays && optimizedPlans.length === 0 && !error && bankHolidays.length > 0 && (
                <Alert className="border-primary/50 bg-primary/5 shadow-lg rounded-xl">
                  <Info className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-primary font-semibold">Ready to plan?</AlertTitle>
                  <AlertDescription>
                    Select your desired year and holiday duration, then click the "Plan Holidays for {selectedYear}" button to generate your personalized holiday plans. 
                    The AI will consider bank holidays for {selectedYear} and {selectedYear + 1}.
                  </AlertDescription>
                </Alert>
              )}

              {optimizedPlans.length > 0 && !isLoading && !isFetchingHolidays && (
                <div className="mt-8">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold font-headline mb-2 text-primary">
                      Optimized Holiday Plans for {SLOVAKIA_COUNTRY_NAME} ({selectedYear} - {selectedYear + 1})
                    </h2>
                    <div className="text-muted-foreground text-base p-3 rounded-md bg-secondary/50 inline-block shadow">
                      <div className="flex items-center justify-center gap-2">
                        <CheckSquare className="h-5 w-5 text-accent" />
                        <span>Used by suggestions: <strong>{totalDaysUsedBySuggestions}</strong> days</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <ListTodo className="h-5 w-5 text-primary" />
                        <span>Remaining allowance: <strong>{remainingAllowance}</strong> days (of {AVAILABLE_DAYS})</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {optimizedPlans.map((plan, index) => (
                      <OptimizedPlanCard key={index} plan={plan} allBankHolidays={bankHolidays} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
          <footer className="py-6 text-center text-sm text-muted-foreground border-t">
            Effective Holiday planning &copy; {currentDisplayYear}
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
