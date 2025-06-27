import { z } from 'zod';

export const DeadlineType = z.enum([
  // Federal - ATO
  'BAS_QUARTERLY',
  'BAS_MONTHLY',
  'PAYG_WITHHOLDING',
  'PAYG_INSTALMENTS',
  'SUPER_GUARANTEE',
  'INCOME_TAX',
  'COMPANY_TAX',
  'FBT',
  'GST',
  'STP_FINALISATION',
  'TPAR',
  
  // Federal - ASIC
  'ASIC_ANNUAL_REVIEW',
  
  // State Revenue
  'PAYROLL_TAX_NSW',
  'PAYROLL_TAX_NSW_ANNUAL',
  'PAYROLL_TAX_VIC',
  'PAYROLL_TAX_VIC_ANNUAL',
  'PAYROLL_TAX_QLD',
  'PAYROLL_TAX_QLD_ANNUAL',
  'PAYROLL_TAX_SA',
  'PAYROLL_TAX_SA_ANNUAL',
  'PAYROLL_TAX_WA',
  'PAYROLL_TAX_WA_ANNUAL',
  'PAYROLL_TAX_TAS',
  'PAYROLL_TAX_TAS_ANNUAL',
  'PAYROLL_TAX_NT',
  'PAYROLL_TAX_NT_ANNUAL',
  'PAYROLL_TAX_ACT',
  'PAYROLL_TAX_ACT_ANNUAL',
  'LAND_TAX_NSW',
  'LAND_TAX_VIC',
  'LAND_TAX_QLD',
  'LAND_TAX_SA',
  'LAND_TAX_WA',
  'LAND_TAX_TAS',
  'LAND_TAX_ACT',
  
  // Other Compliance
  'WORKERS_COMP_NSW',
  'WORKERS_COMP_VIC',
  'WORKERS_COMP_QLD',
  'WORKERS_COMP_SA',
  'WORKERS_COMP_WA',
  'WORKERS_COMP_TAS',
  'WORKERS_COMP_NT',
  'WORKERS_COMP_ACT',
]);

export const Jurisdiction = z.enum(['AU', 'NZ']);

export const Agency = z.enum([
  // Federal
  'ATO',               // Australian Taxation Office
  'ASIC',              // Australian Securities & Investments Commission
  
  // State Revenue
  'REVENUE_NSW',       // Revenue NSW
  'SRO_VIC',           // State Revenue Office Victoria
  'QRO',               // Queensland Revenue Office
  'REVENUE_SA',        // RevenueSA
  'REVENUE_WA',        // RevenueWA
  'SRO_TAS',           // State Revenue Office Tasmania
  'TRO_NT',            // Territory Revenue Office
  'ACT_REVENUE',       // ACT Revenue Office
  
  // Workers Comp
  'ICARE_NSW',         // icare NSW
  'RETURN_TO_WORK_SA', // ReturnToWorkSA
  'WORKCOVER_WA',      // WorkCover WA
  'WORKCOVER_TAS',     // WorkCover Tasmania
  'NT_WORKSAFE',       // NT WorkSafe
  'WORKSAFE_ACT',      // WorkSafe ACT
  
  // New Zealand
  'IRD',               // Inland Revenue Department
  
  // Generic
  'STATE_REVENUE',     // Generic state revenue (legacy)
]);

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