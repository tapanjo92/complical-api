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
  
  // Federal - Excise & Special Taxes
  'FUEL_EXCISE',
  'LUXURY_CAR_TAX',
  'WINE_EQUALISATION_TAX',
  'TOBACCO_EXCISE',
  'ALCOHOL_EXCISE',
  'PETROLEUM_RESOURCE_RENT_TAX',
  'MAJOR_BANK_LEVY',
  
  // Federal - Other Compliance
  'R_AND_D_TAX_INCENTIVE',
  'FUEL_TAX_CREDITS',
  'DIVISION_7A_LOANS',
  'EMDG_APPLICATION',
  
  // Fair Work
  'SUPER_GUARANTEE_INCREASE',
  'MODERN_AWARD_UPDATE',
  'WGEA_REPORTING',
  'LONG_SERVICE_LEAVE',
  'ANNUAL_LEAVE_LOADING',
  
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
  
  // State Revenue - Stamp Duty
  'STAMP_DUTY_PROPERTY_NSW',
  'STAMP_DUTY_PROPERTY_VIC',
  'STAMP_DUTY_PROPERTY_QLD',
  'STAMP_DUTY_PROPERTY_SA',
  'STAMP_DUTY_PROPERTY_WA',
  'STAMP_DUTY_PROPERTY_TAS',
  'STAMP_DUTY_PROPERTY_NT',
  'STAMP_DUTY_PROPERTY_ACT',
  'STAMP_DUTY_VEHICLE_NSW',
  'STAMP_DUTY_VEHICLE_VIC',
  'STAMP_DUTY_VEHICLE_QLD',
  'STAMP_DUTY_VEHICLE_SA',
  'STAMP_DUTY_VEHICLE_WA',
  'STAMP_DUTY_VEHICLE_TAS',
  'STAMP_DUTY_VEHICLE_NT',
  'STAMP_DUTY_VEHICLE_ACT',
  'STAMP_DUTY_INSURANCE_NSW',
  'STAMP_DUTY_INSURANCE_VIC',
  'STAMP_DUTY_INSURANCE_QLD',
  'STAMP_DUTY_INSURANCE_SA',
  'STAMP_DUTY_INSURANCE_WA',
  'STAMP_DUTY_INSURANCE_TAS',
  'STAMP_DUTY_INSURANCE_NT',
  'STAMP_DUTY_INSURANCE_ACT',
  
  // State Revenue - Vehicle Registration
  'VEHICLE_REGO_NSW',
  'VEHICLE_REGO_VIC',
  'VEHICLE_REGO_QLD',
  'VEHICLE_REGO_SA',
  'VEHICLE_REGO_WA',
  'VEHICLE_REGO_TAS',
  'VEHICLE_REGO_NT',
  'VEHICLE_REGO_ACT',
  
  // State Revenue - Other
  'FOREIGN_SURCHARGE_NSW',
  'FOREIGN_SURCHARGE_VIC',
  'FOREIGN_SURCHARGE_QLD',
  'ABSENTEE_OWNER_VIC',
  'EMERGENCY_SERVICES_LEVY_NSW',
  'EMERGENCY_SERVICES_LEVY_VIC',
  'EMERGENCY_SERVICES_LEVY_SA',
  'EMERGENCY_SERVICES_LEVY_TAS',
  'FIRE_SERVICES_LEVY_NSW',
  'FIRE_SERVICES_LEVY_VIC',
  
  // Industry Specific
  'MINING_ROYALTIES_NSW',
  'MINING_ROYALTIES_VIC',
  'MINING_ROYALTIES_QLD',
  'MINING_ROYALTIES_SA',
  'MINING_ROYALTIES_WA',
  'MINING_ROYALTIES_TAS',
  'MINING_ROYALTIES_NT',
  'GAMING_TAX_NSW',
  'GAMING_TAX_VIC',
  'GAMING_TAX_QLD',
  'GAMING_TAX_SA',
  'GAMING_TAX_WA',
  'GAMING_TAX_TAS',
  'GAMING_TAX_NT',
  'GAMING_TAX_ACT',
  'ENVIRONMENTAL_LEVY',
  'WASTE_LEVY',
  
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
  
  // Federal - Other
  'FAIR_WORK',         // Fair Work Commission
  'WGEA',              // Workplace Gender Equality Agency
  'AUSTRADE',          // For EMDG
  'ATO_EXCISE',        // ATO Excise division
  
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
  
  // Transport Authorities
  'SERVICE_NSW',       // Service NSW (vehicle rego)
  'VICROADS',          // VicRoads
  'TMR_QLD',           // Transport and Main Roads QLD
  'DPTI_SA',           // Department of Planning, Transport and Infrastructure SA
  'DOT_WA',            // Department of Transport WA
  'STATE_GROWTH_TAS',  // Department of State Growth TAS
  'MVR_NT',            // Motor Vehicle Registry NT
  'ACCESS_CANBERRA',   // Access Canberra
  
  // Gaming/Liquor Authorities
  'LIQUOR_GAMING_NSW',
  'VCGLR',             // Victorian Commission for Gambling and Liquor Regulation
  'OLGR_QLD',          // Office of Liquor and Gaming Regulation QLD
  'CBS_SA',            // Consumer and Business Services SA
  'RACING_GAMING_WA',
  'LIQUOR_GAMING_TAS',
  'LICENSING_NT',
  'GAMBLING_RACING_ACT',
  
  // Resources/Mining
  'RESOURCES_NSW',
  'EARTH_RESOURCES_VIC',
  'RESOURCES_QLD',
  'ENERGY_MINING_SA',
  'DMIRS_WA',          // Department of Mines, Industry Regulation and Safety
  'MRT_TAS',           // Mineral Resources Tasmania
  'DPIR_NT',           // Department of Primary Industry and Resources
  
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