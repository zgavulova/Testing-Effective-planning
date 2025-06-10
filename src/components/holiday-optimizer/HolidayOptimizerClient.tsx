'use client';

import { useState, useEffect } from 'react';
import type { BankHoliday, OptimizedPlan } from '@/types';
import { optimizeHolidayPlan, OptimizeHolidayPlanInput } from '@/ai/flows/optimize-holiday-plan';
import { Button } from '@/components/ui/button';
import { OptimizedPlanCard } from './OptimizedPlanCard';
import { Wand2, Loader2, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HolidayOptimizerClientProps {
  initialBankHolidays: BankHoliday[];
}

const AVAILABLE_DAYS = 25;
const MIN_HOLIDAY_DURATION = 5;
const MAX_HOLIDAY_DURATION = 10;

export function HolidayOptimizerClient({ initialBankHolidays }: HolidayOptimizerClientProps) {
  const [bankHolidays] = useState<BankHoliday[]>(initialBankHolidays);
  const [optimizedPlans, setOptimizedPlans] = useState<OptimizedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingDays, setRemainingDays] = useState<number>(AVAILABLE_DAYS); // For future use if plans are "selected"

  const handleOptimizeHolidays = async () => {
    setIsLoading(true);
    setError(null);
    setOptimizedPlans([]);

    const bankHolidayDates = bankHolidays.map(h => h.date);

    const input: OptimizeHolidayPlanInput = {
      bankHolidays: bankHolidayDates,
      availableDays: AVAILABLE_DAYS,
      minHolidayDuration: MIN_HOLIDAY_DURATION,
      maxHolidayDuration: MAX_HOLIDAY_DURATION,
    };

    try {
      const result = await optimizeHolidayPlan(input);
      if (result && result.optimizedPlans) {
        setOptimizedPlans(result.optimizedPlans);
      } else {
        setError('No optimized plans could be generated. The AI might not have found suitable options.');
      }
    } catch (e) {
      console.error('Error optimizing holiday plan:', e);
      setError('An error occurred while optimizing holiday plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (initialBankHolidays.length === 0) {
      setError("Could not load initial bank holiday data. Please check your connection or try refreshing the page.");
    }
  }, [initialBankHolidays]);

  return (
    <div className="space-y-8">
      <Card className="bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Plan Your Perfect Getaway</CardTitle>
          <CardDescription>
            Let our AI assistant find the best holiday periods for you, maximizing your time off by leveraging Slovak bank holidays and weekends.
            You have <strong>{AVAILABLE_DAYS}</strong> vacation days. We'll plan for holidays between <strong>{MIN_HOLIDAY_DURATION}</strong> and <strong>{MAX_HOLIDAY_DURATION}</strong> days long.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleOptimizeHolidays}
            disabled={isLoading || initialBankHolidays.length === 0}
            size="lg"
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Optimizing...' : 'Optimize My Holidays'}
          </Button>
           {initialBankHolidays.length === 0 && !isLoading && (
             <Alert variant="destructive" className="mt-4">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>Missing Data</AlertTitle>
               <AlertDescription>
                 Bank holiday data could not be loaded. Optimization is disabled.
               </AlertDescription>
             </Alert>
           )}
        </CardContent>
      </Card>


      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && optimizedPlans.length === 0 && !error && (
         <Alert className="border-primary/50 bg-primary/5">
           <Info className="h-4 w-4 text-primary" />
           <AlertTitle className="text-primary font-semibold">Ready to Plan?</AlertTitle>
           <AlertDescription>
             Click the "Optimize My Holidays" button to generate your personalized holiday plans. 
             The AI will consider Slovak bank holidays for the current ({new Date().getFullYear()}) and next ({new Date().getFullYear() + 1}) year.
           </AlertDescription>
         </Alert>
      )}

      {optimizedPlans.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold font-headline mb-6 text-center text-primary">
            Optimized Holiday Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimizedPlans.map((plan, index) => (
              <OptimizedPlanCard key={index} plan={plan} allBankHolidays={bankHolidays} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal Card component definitions to satisfy type-checker if not globally available
// In a real setup, these would be imported from '@/components/ui/card'
const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
const CardTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;
const CardContent = ({ children }: { children: React.ReactNode }) => <div className="p-6 pt-0">{children}</div>;

