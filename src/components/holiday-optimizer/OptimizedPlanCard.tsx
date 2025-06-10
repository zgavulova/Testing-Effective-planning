'use client';

import type { OptimizedPlan, BankHoliday } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, CheckCircle, ExternalLink, Info } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, addDays, eachDayOfInterval, isWeekend,isSameDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface OptimizedPlanCardProps {
  plan: OptimizedPlan;
  allBankHolidays: BankHoliday[];
}

export function OptimizedPlanCard({ plan, allBankHolidays }: OptimizedPlanCardProps) {
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
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=Slovakia`;
  };

  const modifiers = {
    bankHoliday: planBankHolidayDates,
    weekend: (date: Date) => isWeekend(date),
    vacationDay: vacationDaysTaken,
    selectedPeriod: planDays,
  };

  const modifiersClassNames = {
    bankHoliday: 'bg-accent text-accent-foreground rounded-md',
    weekend: 'text-muted-foreground opacity-70',
    vacationDay: 'bg-primary text-primary-foreground rounded-md font-bold',
    selectedPeriod: 'bg-primary/10 rounded-none',
    today: 'bg-blue-200 text-blue-800 rounded-full'
  };
  
  // Determine number of months to display
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  
  let numberOfMonths = 1;
  if (startYear !== endYear || startMonth !== endMonth) {
    numberOfMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    if (numberOfMonths > 3) numberOfMonths = 3; // Limit to 3 months display for very long edge cases
  }


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <CalendarIcon className="mr-2 h-6 w-6 text-primary" />
          {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
        </CardTitle>
        <CardDescription className="flex items-center">
          <Info className="mr-2 h-4 w-4 text-muted-foreground" />
          {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-primary">Plan Details:</h4>
            <p><Badge variant="secondary" className="mr-2">Vacation Days Used:</Badge> {plan.daysUsed}</p>
            <p><Badge variant="secondary" className="mr-2">Total Days Off:</Badge> {plan.totalDaysOff}</p>
            <div className="mt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" /> View on Calendar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    defaultMonth={startDate}
                    selected={planDays}
                    numberOfMonths={numberOfMonths}
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    ISOWeek
                    className="rounded-md border"
                  />
                   <div className="p-4 text-sm border-t">
                    <p><span className="inline-block w-3 h-3 rounded-full bg-primary mr-2"></span> Vacation Day</p>
                    <p><span className="inline-block w-3 h-3 rounded-full bg-accent mr-2"></span> Bank Holiday</p>
                    <p><span className="opacity-70">Weekend days are grayed out.</span></p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg">
             <h4 className="font-semibold mb-2 text-primary">Key Dates:</h4>
             <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Start Date: <Badge variant="outline">{format(startDate, 'EEE, dd MMM yyyy')}</Badge></li>
                <li>End Date: <Badge variant="outline">{format(endDate, 'EEE, dd MMM yyyy')}</Badge></li>
                {planBankHolidayDates.length > 0 && (
                  <li>Bank Holidays Included:
                    <ul className="list-disc list-inside ml-4">
                    {planBankHolidayDates.map(bh => (
                      <li key={bh.toISOString()}>{format(bh, 'EEE, dd MMM')}</li>
                    ))}
                    </ul>
                  </li>
                )}
             </ul>
          </div>
        </div>

      </CardContent>
      <CardFooter>
        <Button 
          asChild 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <a href={generateGoogleCalendarLink()} target="_blank" rel="noopener noreferrer">
            <CheckCircle className="mr-2 h-5 w-5" /> Add to Google Calendar
            <ExternalLink className="ml-auto h-4 w-4 opacity-70" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
