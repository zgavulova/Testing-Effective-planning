
'use client';

import type { OptimizedPlan, BankHoliday } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, CheckCircle, ExternalLink, Info, Briefcase, TrendingUp, Share2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, addDays, eachDayOfInterval, isWeekend,isSameDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface OptimizedPlanCardProps {
  plan: OptimizedPlan;
  allBankHolidays: BankHoliday[];
}

export function OptimizedPlanCard({ plan, allBankHolidays }: OptimizedPlanCardProps) {
  const { toast } = useToast();
  const startDate = parseISO(plan.startDate);
  const endDate = parseISO(plan.endDate);
  const planDays = eachDayOfInterval({ start: startDate, end: endDate });

  const planBankHolidayDates = allBankHolidays
    .map(bh => parseISO(bh.date))
    .filter(bhDate => planDays.some(planDay => isSameDay(planDay, bhDate)));

  const vacationDaysTaken = planDays.filter(day => 
    !isWeekend(day) && !planBankHolidayDates.some(bhDate => isSameDay(day, bhDate))
  );

  const generateGoogleCalendarLink = () => {
    const dateFormat = "yyyyMMdd";
    const text = encodeURIComponent(`Holiday: ${plan.description.substring(0,50)}...`);
    // For all-day events, Google Calendar expects the end date to be exclusive.
    const dates = `${format(startDate, dateFormat)}/${format(addDays(endDate, 1), dateFormat)}`;
    const details = encodeURIComponent(`Optimized holiday plan. Days used: ${plan.daysUsed}. Total days off: ${plan.totalDaysOff}.\n${plan.description}`);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
  };

  const handleSharePlan = async () => {
    const planSummary = `Check out this holiday plan!
Description: ${plan.description}
Dates: ${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}
Vacation Days Used: ${plan.daysUsed}
Total Days Off: ${plan.totalDaysOff}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Slovak Holiday Plan',
          text: planSummary,
          // url: window.location.href, // Optional: if you want to share a link to the app
        });
        toast({
          title: "Plan Shared!",
          description: "The holiday plan was successfully shared.",
        });
      } catch (error) {
        // This catch block is usually for actual errors or if the user explicitly cancels (AbortError).
        // Some browsers might not throw AbortError for user cancellation, so behavior can vary.
        // We'll attempt to copy to clipboard as a fallback if sharing doesn't complete.
        console.warn('Web Share API failed or was cancelled, attempting clipboard copy:', error);
        try {
          await navigator.clipboard.writeText(planSummary);
          toast({
            title: "Sharing Incomplete, Plan Copied!",
            description: "Could not share directly, but the plan is copied to your clipboard.",
          });
        } catch (copyError) {
          console.error('Failed to copy plan after sharing failed: ', copyError);
          toast({
            title: "Error",
            description: "Could not share or copy the plan. Please try again.",
            variant: "destructive",
          });
        }
      }
    } else {
      // navigator.share is not available, fallback to clipboard
      try {
        await navigator.clipboard.writeText(planSummary);
        toast({
          title: "Plan Copied!",
          description: "Sharing via apps isn't available in your browser. Plan copied to clipboard.",
        });
      } catch (err) {
        console.error('Failed to copy plan: ', err);
        toast({
          title: "Error",
          description: "Could not copy the plan to clipboard. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const modifiers = {
    bankHoliday: planBankHolidayDates,
    weekend: (date: Date) => isWeekend(date),
    vacationDay: vacationDaysTaken,
    selectedPeriod: {from: startDate, to: endDate}, // Use range for highlighting
  };

  const modifiersClassNames = {
    bankHoliday: 'bg-accent text-accent-foreground rounded-md font-semibold',
    weekend: 'text-muted-foreground/70 opacity-80',
    vacationDay: 'bg-primary text-primary-foreground rounded-md font-bold',
    selectedPeriod: 'bg-primary/10 rounded-none',
    today: 'bg-blue-200 text-blue-800 rounded-full !font-bold ring-2 ring-primary'
  };
  
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  
  let numberOfMonths = 1;
  if (startYear !== endYear || startMonth !== endMonth) {
    numberOfMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    if (numberOfMonths > 3) numberOfMonths = 3;
    if (numberOfMonths <=0) numberOfMonths = 1; // Ensure at least one month
  }

  return (
    <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col rounded-xl overflow-hidden bg-card">
      <CardHeader className="bg-primary/5 p-5">
        <CardTitle className="font-headline text-xl lg:text-2xl flex items-center text-primary">
          <CalendarDays className="mr-2.5 h-7 w-7 text-primary" />
          {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
        </CardTitle>
        <CardDescription className="flex items-start pt-1 text-sm">
          <Info className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 space-y-5 flex-grow">
        <div className="grid sm:grid-cols-2 gap-5 items-start">
          <div className="space-y-2">
            <h4 className="font-semibold text-primary flex items-center"><Briefcase className="mr-2 h-5 w-5"/>Plan Details:</h4>
            <p className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Vacation Days Used:</span>
              <Badge variant="secondary" className="font-bold text-base px-2.5 py-1">{plan.daysUsed}</Badge>
            </p>
            <p className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Days Off:</span>
              <Badge variant="default" className="font-bold text-base bg-accent text-accent-foreground px-2.5 py-1">{plan.totalDaysOff}</Badge>
            </p>
            
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg border border-secondary">
             <h4 className="font-semibold mb-2 text-primary flex items-center"><TrendingUp className="mr-2 h-5 w-5"/>Key Info:</h4>
             <ul className="space-y-1.5 text-sm">
                <li>Start: <Badge variant="outline" className="bg-transparent">{format(startDate, 'EEE, dd MMM')}</Badge></li>
                <li>End: <Badge variant="outline" className="bg-transparent">{format(endDate, 'EEE, dd MMM')}</Badge></li>
                {planBankHolidayDates.length > 0 && (
                  <li>Holidays:
                    <span className="ml-1">
                    {planBankHolidayDates.map(bh => (
                      <Badge key={bh.toISOString()} variant="outline" className="bg-accent/20 text-accent-foreground mr-1 mb-1 border-accent/50">{format(bh, 'dd MMM')}</Badge>
                    ))}
                    </span>
                  </li>
                )}
             </ul>
          </div>
        </div>
        <div className="mt-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-primary border-primary/50 hover:bg-primary/10 hover:text-primary">
                <CalendarDays className="mr-2 h-4 w-4" /> View on Calendar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                defaultMonth={startDate}
                selected={{ from: startDate, to: endDate }}
                fromMonth={startDate}
                toMonth={endDate}
                numberOfMonths={numberOfMonths}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                ISOWeek
                className="rounded-md border"
                showOutsideDays={false}
              />
               <div className="p-4 text-xs border-t space-y-1">
                <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-primary mr-1.5 align-middle"></span> Vacation Day</p>
                <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-accent mr-1.5 align-middle"></span> Bank Holiday</p>
                <p><span className="text-muted-foreground/70 opacity-80">Grayed text are weekend days.</span></p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardFooter className="p-5 bg-primary/5 border-t space-x-3">
        <Button 
          onClick={handleSharePlan}
          variant="outline"
          className="w-full text-primary border-primary/50 hover:bg-primary/10 hover:text-primary text-base py-2.5"
        >
          <Share2 className="mr-2 h-5 w-5" /> Share Plan
        </Button>
        <Button 
          asChild 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-base py-2.5"
        >
          <a href={generateGoogleCalendarLink()} target="_blank" rel="noopener noreferrer">
            <CheckCircle className="mr-2 h-5 w-5" /> Add to Calendar
            <ExternalLink className="ml-auto h-4 w-4 opacity-70" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

