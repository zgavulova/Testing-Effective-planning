
'use client';

import * as React from 'react';
import type { BankHoliday } from '@/types';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar'; // Renamed to avoid conflict
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseISO, isWeekend, addMonths, subMonths, startOfMonth, isSameMonth, format as formatDate, getYear as getFullYear, getMonth } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useDayPicker, useDayRender } from 'react-day-picker';
import { Lightbulb, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'; // Added CalendarIcon
import { cn } from '@/lib/utils';
import { buttonVariants, Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface UserPreferenceCalendarProps {
  year: number;
  availableYears: number[];
  onYearChange: (yearValue: string) => void;
  allBankHolidays: BankHoliday[];
  selectedRange: DateRange | undefined;
  onRangeSelect: (range: DateRange | undefined) => void;
}

export function UserPreferenceCalendar({
  year,
  availableYears,
  onYearChange,
  allBankHolidays,
  selectedRange,
  onRangeSelect,
}: UserPreferenceCalendarProps) {
  const getInitialDisplayMonth = (planningYear: number): Date => {
    const today = new Date();
    const actualCurrentYear = getFullYear(today);
    if (planningYear === actualCurrentYear) {
      return startOfMonth(new Date(planningYear, getMonth(today), 1));
    }
    return startOfMonth(new Date(planningYear, 0, 1));
  };

  const [displayedMonth, setDisplayedMonth] = React.useState<Date>(() => getInitialDisplayMonth(year));

  React.useEffect(() => {
    setDisplayedMonth(getInitialDisplayMonth(year));
  }, [year]);

  const bankHolidayMap = React.useMemo(() => {
    const map = new Map<string, BankHoliday>();
    allBankHolidays.forEach(holiday => {
      map.set(holiday.date, holiday);
    });
    return map;
  }, [allBankHolidays]);

  const bankHolidayDatesForModifier = allBankHolidays.map(bh => parseISO(bh.date));

  const modifiers = {
    bankHoliday: bankHolidayDatesForModifier,
    weekend: (date: Date) => isWeekend(date),
  };

  const modifiersClassNames = {
    bankHoliday: 'bg-accent text-accent-foreground font-semibold',
    weekend: 'text-muted-foreground/60 opacity-80',
    today: 'bg-secondary text-secondary-foreground !font-bold ring-1 ring-ring',
  };

  function CustomDay(props: { date: Date; displayMonth: Date }) {
    const { date, displayMonth } = props;
    const dayPicker = useDayPicker();
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const dayRender = useDayRender(date, displayMonth, buttonRef);
  
    if (dayRender.isHidden) {
      return <></>;
    }
  
    if (!dayRender.isButton || !dayRender.buttonProps) {
      return <div {...dayRender.divProps} />;
    }
    
    const dayNumber = dayPicker.formatters.formatDay ? dayPicker.formatters.formatDay(date, dayPicker.locale) : formatDate(date, 'd');
    const dateString = formatDate(date, 'yyyy-MM-dd');
    const holiday = bankHolidayMap.get(dateString);
  
    let finalButtonClassName = dayRender.buttonProps.className;
  
    if (holiday) {
      finalButtonClassName = cn(finalButtonClassName, modifiersClassNames.bankHoliday);
      return (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                {...dayRender.buttonProps}
                className={finalButtonClassName}
                ref={buttonRef}
              >
                {dayNumber}
              </button>
            </TooltipTrigger>
            <TooltipContent className="p-1.5 text-xs bg-popover text-popover-foreground border shadow-md rounded-md">
              <p>{holiday.localName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  
    return (
      <button
        {...dayRender.buttonProps}
        className={finalButtonClassName}
        ref={buttonRef}
      >
        {dayNumber}
      </button>
    );
  }
  
  const minCalendarDate = startOfMonth(new Date(year, 0, 1));
  const maxCalendarDate = startOfMonth(new Date(year + 1, 11, 1)); 

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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-6 w-6 text-primary" /> {/* Changed Icon */}
            <CardTitle className="font-headline text-lg text-primary">
              Calendar Overview
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
        <div className="flex items-center gap-2 mb-1">
          <Label htmlFor="sidebar-year-select" className="text-sm font-medium text-muted-foreground whitespace-nowrap">View Year:</Label>
          <Select onValueChange={onYearChange} value={String(year)}>
            <SelectTrigger id="sidebar-year-select" className="h-9 w-full text-sm">
              <SelectValue placeholder="Select year..." />
            </SelectTrigger>      
            <SelectContent>
              {availableYears.map(y => (
                <SelectItem key={y} value={String(y)} className="text-sm">
                  {y} (Covers {y} & {y + 1})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-1">
           Displaying: {formatDate(displayedMonth, 'MMM yyyy')} - {formatDate(addMonths(displayedMonth, 2), 'MMM yyyy')}. Bank holidays for {year} & {year+1} are highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 md:p-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-2">
          <p className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-accent mr-1 align-middle"></span>Bank Holiday</p>
          <p className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-primary mr-1 align-middle"></span>Your Selection</p>
          <p className="flex items-center"><span className="inline-block w-3 h-3 rounded-full bg-secondary mr-1 align-middle"></span>Today</p>
        </div>
        <div className="rounded-md border bg-background/50 p-1">
          <ShadcnCalendar
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
            weekStartsOn={1} 
            classNames={{
                root: "w-full pb-1",
                months: "flex flex-col gap-y-3", 
                month: "space-y-1 min-w-0 w-full bg-card p-1.5 rounded-md shadow-sm", 
                caption_label: "text-xs font-medium text-primary text-center",
                caption: "flex justify-center items-center relative h-6 mb-1",
                nav_button: "absolute top-0 h-6 w-6", 
                nav_button_previous: "left-0", 
                nav_button_next: "right-0", 
                head_row: "flex justify-around mb-1",
                head_cell: "text-muted-foreground rounded-md w-7 h-7 font-normal text-[0.7rem] flex items-center justify-center",
                row: "flex w-full mt-1 justify-around",
                cell: "w-7 h-7 text-center text-[0.7rem] p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-primary/20 [&:has([aria-selected])]:bg-primary/80 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20", 
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "w-7 h-7 p-0 font-normal aria-selected:opacity-100" 
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-full", 
                day_today: "bg-secondary text-secondary-foreground rounded-full", 
                day_outside: "day-outside text-muted-foreground opacity-30 aria-selected:bg-primary/10 aria-selected:text-primary-foreground/80",
                day_disabled: "text-muted-foreground opacity-40",
                day_range_middle: "aria-selected:bg-primary/30 aria-selected:text-primary-foreground rounded-none", 
            }}
            components={{
              Day: CustomDay,
              IconLeft: () => null, 
              IconRight: () => null,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
