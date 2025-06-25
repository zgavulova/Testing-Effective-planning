
'use client';

import type { ManualPlanDetails } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, CheckCircle, ExternalLink, Briefcase, X, Sun, Moon, Sparkles } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ManualPlanCardProps {
  details: ManualPlanDetails;
  onClear: () => void;
}

export function ManualPlanCard({ details, onClear }: ManualPlanCardProps) {
  const { startDate, endDate, totalDays, vacationDays, weekendDays, bankHolidays, bankHolidayNames } = details;

  const generateGoogleCalendarLink = () => {
    const dateFormat = "yyyyMMdd";
    const text = encodeURIComponent(`My Custom Holiday`);
    const dates = `${format(startDate, dateFormat)}/${format(addDays(endDate, 1), dateFormat)}`;
    const detailsText = encodeURIComponent(`Manually planned holiday.
Vacation Days: ${vacationDays}
Total Days Off: ${totalDays}
(Includes ${weekendDays} weekend days and ${bankHolidays} bank holidays)`);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${detailsText}`;
  };

  return (
    <Card className="shadow-xl border-primary/50 bg-primary/5 transition-all duration-300 flex flex-col rounded-xl overflow-hidden">
      <CardHeader className="p-5">
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline text-xl lg:text-2xl flex items-center text-primary">
            <Sparkles className="mr-2.5 h-7 w-7 text-primary" />
            Your Custom Holiday Plan
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClear}>
            <X className="h-5 w-5" />
            <span className="sr-only">Clear Selection</span>
          </Button>
        </div>
        <CardDescription className="flex flex-col pt-1 text-sm text-primary/80">
          Analysis of your selected period from {format(startDate, 'dd MMM yyyy')} to {format(endDate, 'dd MMM yyyy')}.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 space-y-4 flex-grow">
        <div className="p-4 bg-secondary/50 rounded-lg border border-secondary space-y-3">
          <div className="flex items-center justify-between text-base">
            <span className="text-muted-foreground flex items-center"><Briefcase className="mr-2 h-5 w-5"/>Vacation Days Needed:</span>
            <Badge variant="destructive" className="font-bold text-lg px-3 py-1.5">{vacationDays}</Badge>
          </div>
           <div className="flex items-center justify-between text-base">
            <span className="text-muted-foreground flex items-center"><CalendarDays className="mr-2 h-5 w-5"/>Total Time Off:</span>
            <Badge variant="accent" className="font-bold text-lg px-3 py-1.5">{totalDays} days</Badge>
          </div>
        </div>
        
        <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-accent" />
                <span className="font-semibold">{weekendDays}</span>
                <span>Weekend Days</span>
            </div>
            <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                <span className="font-semibold">{bankHolidays}</span>
                <span>Bank Holidays</span>
            </div>
            {bankHolidayNames.length > 0 && (
                <div className="pl-6 text-xs text-muted-foreground italic">
                    ({bankHolidayNames.join(', ')})
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="p-5 bg-primary/10 border-t">
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
