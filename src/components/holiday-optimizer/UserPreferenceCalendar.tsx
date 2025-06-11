
'use client';

import type { BankHoliday } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseISO, isWeekend, addMonths, subMonths, startOfMonth, isSameMonth, format as formatDate } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants, Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface UserPreferenceCalendarProps {
  year: number;
  allBankHolidays: BankHoliday[]; // Changed from bankHolidays to allBankHolidays
  selectedRange: DateRange | undefined;
  onRangeSelect: (range: DateRange | undefined) => void;
}

export function UserPreferenceCalendar({
  year,
  allBankHolidays,
  selectedRange,
  onRangeSelect,
}: UserPreferenceCalendarProps) {
  const [displayedMonth, setDisplayedMonth] = useState<Date>(() => startOfMonth(new Date(year, 0, 1)));

  useEffect(() => {
    setDisplayedMonth(startOfMonth(new Date(year, 0, 1)));
  }, [year]);

  const bankHolidayDates = allBankHolidays.map(bh => parseISO(bh.date));

  const modifiers = {
    bankHoliday: bankHolidayDates,
    weekend: (date: Date) => isWeekend(date),
  };

  const modifiersClassNames = {
    bankHoliday: 'bg-accent text-accent-foreground rounded-full font-semibold !w-7 !h-7', // Adjusted size
    weekend: 'text-muted-foreground/60',
    today: 'bg-secondary text-secondary-foreground rounded-full !font-bold ring-1 ring-ring !w-7 !h-7', // Adjusted size
  };
  
  const minCalendarDate = startOfMonth(new Date(year, 0, 1));
  const maxCalendarDate = startOfMonth(new Date(year + 1, 11, 1)); // Last day of December of the next year

  // The last month that can start a 3-month view without exceeding maxCalendarDate
  const lastPossibleStartMonthForView = subMonths(maxCalendarDate, 2);

  const handlePreviousMonths = () => {
    setDisplayedMonth((current) => subMonths(current, 1));
  };

  const handleNextMonths = () => {
    setDisplayedMonth((current) => addMonths(current, 1));
  };

  const canGoPrevious = !isSameMonth(displayedMonth, minCalendarDate) && displayedMonth > minCalendarDate;
  const canGoNext = !isSameMonth(displayedMonth, lastPossibleStartMonthForView) && displayedMonth < lastPossibleStartMonthForView;

  return (
    <Card className="bg-card shadow-lg rounded-xl overflow-hidden w-full">
      <CardHeader className="bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-lg text-primary">
              Year Overview for {year}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePreviousMonths} disabled={!canGoPrevious}>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous months</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextMonths} disabled={!canGoNext}>
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next months</span>
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-1">
           {formatDate(displayedMonth, 'MMM yyyy')} - {formatDate(addMonths(displayedMonth, 2), 'MMM yyyy')}. Click to select a date range.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 md:p-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-2">
          <p className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-accent mr-1 align-middle"></span>Bank Holiday</p>
          <p className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-primary mr-1 align-middle"></span>Your Selection</p>
          <p className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-secondary mr-1 align-middle"></span>Today</p>
        </div>
        <div className="rounded-md border bg-background/50 p-1">
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={onRangeSelect}
            month={displayedMonth}
            numberOfMonths={3}
            fromMonth={minCalendarDate}
            toMonth={maxCalendarDate}
            showOutsideDays={false}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="w-full"
            classNames={{
                root: "w-full pb-1",
                months: "flex flex-nowrap justify-around gap-x-1", 
                month: "space-y-1 min-w-0 flex-1 bg-card p-1.5 rounded-md shadow-sm", 
                caption_label: "text-xs font-medium text-primary text-center",
                caption: "flex justify-center items-center relative h-6 mb-1",
                nav_button: "absolute top-0 h-6 w-6",
                nav_button_previous: "left-0",
                nav_button_next: "right-0",
                head_row: "flex justify-around mb-1",
                head_cell: "text-muted-foreground rounded-md w-7 h-7 font-normal text-[0.7rem] flex items-center justify-center", // Adjusted size
                row: "flex w-full mt-1 justify-around",
                cell: "w-7 h-7 text-center text-[0.7rem] p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-primary/20 [&:has([aria-selected])]:bg-primary/80 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20", // Adjusted size
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-7 h-7 p-0 font-normal aria-selected:opacity-100" // Adjusted size
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-full",
                day_today: "bg-secondary text-secondary-foreground rounded-full",
                day_outside: "day-outside text-muted-foreground opacity-30 aria-selected:bg-primary/10 aria-selected:text-primary-foreground/80",
                day_disabled: "text-muted-foreground opacity-40",
                day_range_middle: "aria-selected:bg-primary/30 aria-selected:text-primary-foreground rounded-none",
            }}
            components={{
              IconLeft: () => null, // Disable default nav buttons, using custom ones
              IconRight: () => null,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
