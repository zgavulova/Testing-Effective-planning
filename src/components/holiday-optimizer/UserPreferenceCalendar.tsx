
'use client';

import type { BankHoliday } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseISO, isWeekend } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface UserPreferenceCalendarProps {
  year: number;
  bankHolidays: BankHoliday[]; // Should be pre-filtered for the given year
  selectedRange: DateRange | undefined;
  onRangeSelect: (range: DateRange | undefined) => void;
}

export function UserPreferenceCalendar({
  year,
  bankHolidays,
  selectedRange,
  onRangeSelect,
}: UserPreferenceCalendarProps) {
  const bankHolidayDatesForYear = bankHolidays.map(bh => parseISO(bh.date));

  const modifiers = {
    bankHoliday: bankHolidayDatesForYear,
    weekend: (date: Date) => isWeekend(date),
  };

  const modifiersClassNames = {
    bankHoliday: 'bg-accent text-accent-foreground rounded-full font-semibold !w-10 !h-10',
    weekend: 'text-muted-foreground/60',
    today: 'bg-secondary text-secondary-foreground rounded-full !font-bold ring-2 ring-ring',
  };

  return (
    <Card className="bg-card shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-primary/5 p-6">
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <Lightbulb className="mr-3 h-7 w-7" />
          Year Overview & Preferences for {year}
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground pt-2">
          View all bank holidays for {year}. Click a date to start selecting a range, then click another date to complete it. This can help you visualize potential holiday periods.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-4">
          <p className="flex items-center"><span className="inline-block w-3.5 h-3.5 rounded-full bg-accent mr-1.5 border border-accent-foreground/20 align-middle"></span> Bank Holiday</p>
          <p className="flex items-center"><span className="inline-block w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground mr-1.5 border border-primary-foreground/20 align-middle"></span> Your Selection</p>
          <p className="flex items-center"><span className="inline-block w-3.5 h-3.5 rounded-full bg-secondary text-secondary-foreground mr-1.5 border border-secondary-foreground/20 align-middle"></span> Today</p>
          <p className="text-muted-foreground/70">Grayed text indicates weekend days.</p>
        </div>
        <div className="rounded-md border bg-background/50 p-0 md:p-2">
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={onRangeSelect}
            defaultMonth={new Date(year, 0, 1)} // January of the selected year
            numberOfMonths={12}
            showOutsideDays={false}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="w-full" // Calendar itself should be full width to allow inner scrolling
            classNames={{
                root: "w-full overflow-x-auto pb-2", // Enable horizontal scroll on the root if months overflow
                months: "flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-x-4 gap-y-6 p-2", // flex-nowrap for horizontal scroll, or flex-wrap for grid
                month: "space-y-2 min-w-[280px] sm:min-w-[300px] border rounded-lg p-3 shadow-sm bg-card",
                caption_label: "text-lg font-bold text-primary",
                nav_button_previous: "absolute left-1 top-1/2 -translate-y-1/2", // Positioning for overall nav if it were enabled
                nav_button_next: "absolute right-1 top-1/2 -translate-y-1/2",
                head_cell: "text-muted-foreground rounded-md w-9 h-9 sm:w-10 sm:h-10 font-normal text-xs sm:text-sm flex items-center justify-center",
                cell: "w-9 h-9 sm:w-10 sm:h-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-primary/20 [&:has([aria-selected])]:bg-primary/80 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-9 h-9 sm:w-10 sm:h-10 p-0 font-normal aria-selected:opacity-100"
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-full",
                day_today: "bg-secondary text-secondary-foreground rounded-full",
                day_outside: "day-outside text-muted-foreground opacity-30 aria-selected:bg-primary/10 aria-selected:text-primary-foreground/80",
                day_disabled: "text-muted-foreground opacity-40",
                day_range_middle: "aria-selected:bg-primary/30 aria-selected:text-primary-foreground rounded-none",
                day_range_start: "aria-selected:rounded-l-full", // Ensure these apply on top of day_selected
                day_range_end: "aria-selected:rounded-r-full",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
