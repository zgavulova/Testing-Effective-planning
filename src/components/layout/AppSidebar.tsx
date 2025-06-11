
'use client';

import type { BankHoliday } from '@/types';
import type { DateRange } from 'react-day-picker';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { UserPreferenceCalendar } from '@/components/holiday-optimizer/UserPreferenceCalendar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppSidebarProps {
  year: number;
  allBankHolidays: BankHoliday[];
  selectedRange: DateRange | undefined;
  onRangeSelect: (range: DateRange | undefined) => void;
  countryName?: string;
}

export function AppSidebar({
  year,
  allBankHolidays,
  selectedRange,
  onRangeSelect,
  countryName = 'Slovakia',
}: AppSidebarProps) {
  return (
    <Sidebar 
      side="left" 
      collapsible="icon" 
      className="border-r shadow-lg"
      style={{ "--sidebar-width": "26rem", "--sidebar-width-icon": "3.5rem" } as React.CSSProperties} // Adjusted width for 3 calendars
    >
      <SidebarHeader className="p-3 border-b">
        <div className="text-base font-semibold group-data-[collapsible=icon]:hidden">Calendar View</div>
        <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          {countryName} ({year} - {year + 1})
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0 group-data-[collapsible=icon]:p-0">
        <ScrollArea className="h-full group-data-[collapsible=icon]:hidden">
          <div className="p-2">
            <UserPreferenceCalendar
              year={year}
              allBankHolidays={allBankHolidays}
              selectedRange={selectedRange}
              onRangeSelect={onRangeSelect}
            />
          </div>
        </ScrollArea>
         <div className="p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center hidden h-full">
            {/* Content for collapsed icon sidebar, e.g. a calendar icon - not implemented yet */}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
