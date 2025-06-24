export interface BankHoliday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

// This is based on the OptimizeHolidayPlanOutput from the AI flow
export interface OptimizedPlan {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysUsed: number;
  totalDaysOff: number;
  description: string;
  note?: string; // Added new optional note field
}

export interface ManualPlanDetails {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  vacationDays: number;
  weekendDays: number;
  bankHolidays: number;
  bankHolidayNames: string[];
}
