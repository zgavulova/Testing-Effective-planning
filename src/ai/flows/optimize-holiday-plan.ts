'use server';

/**
 * @fileOverview AI-powered holiday optimization flow for Slovak calendar.
 *
 * - optimizeHolidayPlan - A function to generate optimized holiday plans.
 * - OptimizeHolidayPlanInput - Input type for the optimizeHolidayPlan function.
 * - OptimizeHolidayPlanOutput - Return type for the optimizeHolidayPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeHolidayPlanInputSchema = z.object({
  bankHolidays: z.array(z.string()).describe('Array of Slovak bank holidays in YYYY-MM-DD format.'),
  availableDays: z.number().describe('Number of available holiday days (e.g., 25).'),
  minHolidayDuration: z.number().describe('Minimum duration of a holiday in days (e.g., 5).'),
  maxHolidayDuration: z.number().describe('Maximum duration of a holiday in days (e.g., 10).'),
});
export type OptimizeHolidayPlanInput = z.infer<typeof OptimizeHolidayPlanInputSchema>;

const OptimizeHolidayPlanOutputSchema = z.object({
  optimizedPlans: z.array(
    z.object({
      startDate: z.string().describe('Start date of the optimized holiday plan in YYYY-MM-DD format.'),
      endDate: z.string().describe('End date of the optimized holiday plan in YYYY-MM-DD format.'),
      daysUsed: z.number().describe('Number of vacation days used in this plan.'),
      totalDaysOff: z.number().describe('Total number of days off (including weekends and holidays).'),
      description: z.string().describe('Description of the optimized plan, explaining the rationale.'),
    })
  ).describe('Array of optimized holiday plans.'),
});
export type OptimizeHolidayPlanOutput = z.infer<typeof OptimizeHolidayPlanOutputSchema>;

export async function optimizeHolidayPlan(input: OptimizeHolidayPlanInput): Promise<OptimizeHolidayPlanOutput> {
  return optimizeHolidayPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeHolidayPlanPrompt',
  input: {schema: OptimizeHolidayPlanInputSchema},
  output: {schema: OptimizeHolidayPlanOutputSchema},
  prompt: `You are an expert holiday planning assistant, specializing in Slovak holidays.

  Given the following Slovak bank holidays, available holiday days, and desired holiday duration, generate optimized holiday plans that maximize time off while minimizing the number of vacation days used.

  Slovak Bank Holidays: {{bankHolidays}}
  Available Holiday Days: {{availableDays}}
  Holiday Duration: Minimum {{minHolidayDuration}} days, Maximum {{maxHolidayDuration}} days

  Consider weekends and bank holidays when creating the plans. Aim to create plans that include these days to extend the holiday period with fewer vacation days.

  Return an array of optimized plans, each including the start date, end date, number of vacation days used, the total number of days off, and a description of the plan.
  `,
});

const optimizeHolidayPlanFlow = ai.defineFlow(
  {
    name: 'optimizeHolidayPlanFlow',
    inputSchema: OptimizeHolidayPlanInputSchema,
    outputSchema: OptimizeHolidayPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
