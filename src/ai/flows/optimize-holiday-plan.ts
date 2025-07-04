
'use server';

/**
 * @fileOverview AI-powered holiday optimization flow for European countries.
 *
 * - optimizeHolidayPlan - A function to generate optimized holiday plans.
 * - OptimizeHolidayPlanInput - Input type for the optimizeHolidayPlan function.
 * - OptimizeHolidayPlanOutput - Return type for the optimizeHolidayPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeHolidayPlanInputSchema = z.object({
  countryCode: z.string().describe('The ISO 3166-1 alpha-2 country code (e.g., SK, DE, FR).'),
  bankHolidays: z.array(z.string()).describe('Array of bank holidays in YYYY-MM-DD format for the specified country.'),
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
      note: z.string().optional().describe('A short, engaging note or suggestion for the type of trip this plan is ideal for (e.g., "Perfect for a summer getaway", "Ideal for a cozy winter break").'),
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
  prompt: `You are an expert holiday planning assistant, specializing in holidays for European countries.

  Given the following bank holidays for country code {{countryCode}}, available holiday days, and desired holiday duration, generate optimized holiday plans that maximize time off while minimizing the number of vacation days used.

  Country Code: {{countryCode}}
  Bank Holidays: {{bankHolidays}}
  Available Holiday Days: {{availableDays}}
  Holiday Duration: Minimum {{minHolidayDuration}} days, Maximum {{maxHolidayDuration}} days

  Consider weekends and bank holidays when creating the plans. Aim to create plans that include these days to extend the holiday period with fewer vacation days.
  For each optimized plan, please also provide a concise and appealing 'note' (around 5-10 words). This note should suggest the type of trip the plan is best suited for, or a key highlight. Examples: 'Ideal for a spring city break', 'Perfect for exploring nature trails', 'Enjoy the autumn colors', 'Great for a long weekend ski trip'.

  Return an array of optimized plans, each including the start date, end date, number of vacation days used, the total number of days off, a description of the plan, and the generated note.
  `,
});

const optimizeHolidayPlanFlow = ai.defineFlow(
  {
    name: 'optimizeHolidayPlanFlow',
    inputSchema: OptimizeHolidayPlanInputSchema,
    outputSchema: OptimizeHolidayPlanOutputSchema,
  },
  async input => {
    const genResponse = await prompt(input);
    const output = genResponse.output;

    if (!output) {
      console.error(
        'AI model failed to generate a valid plan. Full response object:',
        JSON.stringify(genResponse, null, 2)
      );
      throw new Error(
        'The AI model could not generate holiday plans. This might be due to the complexity of the request, insufficient holiday data, or a temporary issue with the AI service. Please try adjusting your request or try again later.'
      );
    }
    return output;
  }
);
