import { z } from 'zod';

export const DeadlineType = z.enum([
  'BAS_QUARTERLY',
  'BAS_MONTHLY',
  'PAYG_WITHHOLDING',
  'SUPER_GUARANTEE',
  'INCOME_TAX',
  'FBT',
  'GST',
  'COMPANY_TAX',
]);

export const Jurisdiction = z.enum(['AU', 'NZ']);

export const Agency = z.enum(['ATO', 'IRD', 'ASIC', 'STATE_REVENUE']);

export const DeadlineSchema = z.object({
  id: z.string(),
  type: DeadlineType,
  name: z.string(),
  description: z.string(),
  jurisdiction: Jurisdiction,
  agency: Agency,
  dueDate: z.string(), // ISO date string
  period: z.string(), // e.g., "Q1 2024", "Monthly", "Annual"
  applicableTo: z.array(z.string()), // e.g., ["small_business", "gst_registered"]
  sourceUrl: z.string(),
  sourceVerifiedAt: z.string(), // ISO datetime
  lastUpdated: z.string(), // ISO datetime
  notes: z.string().optional(),
});

export type Deadline = z.infer<typeof DeadlineSchema>;

// DynamoDB key structure
export interface DeadlineKey {
  PK: string; // 'DEADLINE#<type>'
  SK: string; // '<jurisdiction>#<yyyy-mm-dd>'
}

export interface DeadlineGSI1 {
  GSI1PK: string; // 'JURISDICTION#<jurisdiction>'
  GSI1SK: string; // '<yyyy-mm-dd>#<type>'
}

export interface DeadlineGSI2 {
  GSI2PK: string; // 'DATE#<yyyy-mm>'
  GSI2SK: string; // '<yyyy-mm-dd>#<type>'
}