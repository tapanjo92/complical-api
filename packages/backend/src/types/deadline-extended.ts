import { z } from 'zod';

export const ExtendedDeadlineType = z.enum([
  // Federal - ATO (existing)
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
  
  // Federal - ASIC (existing)
  'ASIC_ANNUAL_REVIEW',
  
  // Federal - Excise & Special Taxes (NEW)
  'FUEL_EXCISE',
  'LUXURY_CAR_TAX',
  'WINE_EQUALISATION_TAX',
  'TOBACCO_EXCISE',
  'ALCOHOL_EXCISE',
  'PETROLEUM_RESOURCE_RENT_TAX',
  'MAJOR_BANK_LEVY',
  
  // Federal - Other Compliance (NEW)
  'R_AND_D_TAX_INCENTIVE',
  'FUEL_TAX_CREDITS',
  'DIVISION_7A_LOANS',
  'EMDG_APPLICATION',
  
  // Fair Work (NEW)
  'SUPER_GUARANTEE_INCREASE',
  'MODERN_AWARD_UPDATE',
  'WGEA_REPORTING',
  'LONG_SERVICE_LEAVE',
  'ANNUAL_LEAVE_LOADING',
  
  // State Revenue - Payroll Tax (existing)
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
  
  // State Revenue - Land Tax (existing)
  'LAND_TAX_NSW',
  'LAND_TAX_VIC',
  'LAND_TAX_QLD',
  'LAND_TAX_SA',
  'LAND_TAX_WA',
  'LAND_TAX_TAS',
  'LAND_TAX_ACT',
  
  // State Revenue - Stamp Duty (NEW)
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
  
  // State Revenue - Vehicle Registration (NEW)
  'VEHICLE_REGO_NSW',
  'VEHICLE_REGO_VIC',
  'VEHICLE_REGO_QLD',
  'VEHICLE_REGO_SA',
  'VEHICLE_REGO_WA',
  'VEHICLE_REGO_TAS',
  'VEHICLE_REGO_NT',
  'VEHICLE_REGO_ACT',
  
  // State Revenue - Other (NEW)
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
  
  // Industry Specific (NEW)
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
  
  // Workers Comp (existing)
  'WORKERS_COMP_NSW',
  'WORKERS_COMP_VIC',
  'WORKERS_COMP_QLD',
  'WORKERS_COMP_SA',
  'WORKERS_COMP_WA',
  'WORKERS_COMP_TAS',
  'WORKERS_COMP_NT',
  'WORKERS_COMP_ACT',
]);

export const ExtendedAgency = z.enum([
  // Federal (existing)
  'ATO',               // Australian Taxation Office
  'ASIC',              // Australian Securities & Investments Commission
  
  // Federal (NEW)
  'FAIR_WORK',         // Fair Work Commission
  'WGEA',              // Workplace Gender Equality Agency
  'AUSTRADE',          // For EMDG
  'ATO_EXCISE',        // ATO Excise division
  
  // State Revenue (existing)
  'REVENUE_NSW',       // Revenue NSW
  'SRO_VIC',           // State Revenue Office Victoria
  'QRO',               // Queensland Revenue Office
  'REVENUE_SA',        // RevenueSA
  'REVENUE_WA',        // RevenueWA
  'SRO_TAS',           // State Revenue Office Tasmania
  'TRO_NT',            // Territory Revenue Office
  'ACT_REVENUE',       // ACT Revenue Office
  
  // Transport Authorities (NEW)
  'SERVICE_NSW',       // Service NSW (vehicle rego)
  'VICROADS',          // VicRoads
  'TMR_QLD',           // Transport and Main Roads QLD
  'DPTI_SA',           // Department of Planning, Transport and Infrastructure SA
  'DOT_WA',            // Department of Transport WA
  'STATE_GROWTH_TAS',  // Department of State Growth TAS
  'MVR_NT',            // Motor Vehicle Registry NT
  'ACCESS_CANBERRA',   // Access Canberra
  
  // Gaming/Liquor Authorities (NEW)
  'LIQUOR_GAMING_NSW',
  'VCGLR',             // Victorian Commission for Gambling and Liquor Regulation
  'OLGR_QLD',          // Office of Liquor and Gaming Regulation QLD
  'CBS_SA',            // Consumer and Business Services SA
  'RACING_GAMING_WA',
  'LIQUOR_GAMING_TAS',
  'LICENSING_NT',
  'GAMBLING_RACING_ACT',
  
  // Resources/Mining (NEW)
  'RESOURCES_NSW',
  'EARTH_RESOURCES_VIC',
  'RESOURCES_QLD',
  'ENERGY_MINING_SA',
  'DMIRS_WA',          // Department of Mines, Industry Regulation and Safety
  'MRT_TAS',           // Mineral Resources Tasmania
  'DPIR_NT',           // Department of Primary Industry and Resources
  
  // Workers Comp (existing)
  'ICARE_NSW',         // icare NSW
  'WORKSAFE_VIC',      // WorkSafe Victoria
  'WORKCOVER_QLD',     // WorkCover Queensland
  'RETURN_TO_WORK_SA', // ReturnToWorkSA
  'WORKCOVER_WA',      // WorkCover WA
  'WORKCOVER_TAS',     // WorkCover Tasmania
  'NT_WORKSAFE',       // NT WorkSafe
  'WORKSAFE_ACT',      // WorkSafe ACT
  
  // New Zealand (existing)
  'IRD',               // Inland Revenue Department
  
  // Generic (legacy)
  'STATE_REVENUE',     // Generic state revenue
]);

// Category mappings for the ultra-simple endpoint
export const EXTENDED_CATEGORY_MAPPINGS = {
  'tax': [
    'BAS_QUARTERLY', 'BAS_MONTHLY', 'PAYG_WITHHOLDING', 'PAYG_INSTALMENTS',
    'INCOME_TAX', 'COMPANY_TAX', 'FBT', 'GST', 'FUEL_EXCISE',
    'LUXURY_CAR_TAX', 'WINE_EQUALISATION_TAX', 'TOBACCO_EXCISE',
    'ALCOHOL_EXCISE', 'PETROLEUM_RESOURCE_RENT_TAX', 'MAJOR_BANK_LEVY'
  ],
  'payroll': [
    'PAYROLL_TAX_NSW', 'PAYROLL_TAX_NSW_ANNUAL', 'PAYROLL_TAX_VIC',
    'PAYROLL_TAX_VIC_ANNUAL', 'PAYROLL_TAX_QLD', 'PAYROLL_TAX_QLD_ANNUAL',
    'PAYROLL_TAX_SA', 'PAYROLL_TAX_SA_ANNUAL', 'PAYROLL_TAX_WA',
    'PAYROLL_TAX_WA_ANNUAL', 'PAYROLL_TAX_TAS', 'PAYROLL_TAX_TAS_ANNUAL',
    'PAYROLL_TAX_NT', 'PAYROLL_TAX_NT_ANNUAL', 'PAYROLL_TAX_ACT',
    'PAYROLL_TAX_ACT_ANNUAL', 'PAYG_WITHHOLDING', 'STP_FINALISATION'
  ],
  'compliance': [
    'ASIC_ANNUAL_REVIEW', 'WORKERS_COMP_NSW', 'WORKERS_COMP_VIC',
    'WORKERS_COMP_QLD', 'WORKERS_COMP_SA', 'WORKERS_COMP_WA',
    'WORKERS_COMP_TAS', 'WORKERS_COMP_NT', 'WORKERS_COMP_ACT',
    'WGEA_REPORTING', 'LONG_SERVICE_LEAVE', 'ANNUAL_LEAVE_LOADING'
  ],
  'super': [
    'SUPER_GUARANTEE', 'SUPER_GUARANTEE_INCREASE'
  ],
  'property': [
    'LAND_TAX_NSW', 'LAND_TAX_VIC', 'LAND_TAX_QLD', 'LAND_TAX_SA',
    'LAND_TAX_WA', 'LAND_TAX_TAS', 'LAND_TAX_ACT',
    'STAMP_DUTY_PROPERTY_NSW', 'STAMP_DUTY_PROPERTY_VIC',
    'STAMP_DUTY_PROPERTY_QLD', 'STAMP_DUTY_PROPERTY_SA',
    'STAMP_DUTY_PROPERTY_WA', 'STAMP_DUTY_PROPERTY_TAS',
    'STAMP_DUTY_PROPERTY_NT', 'STAMP_DUTY_PROPERTY_ACT',
    'FOREIGN_SURCHARGE_NSW', 'FOREIGN_SURCHARGE_VIC',
    'FOREIGN_SURCHARGE_QLD', 'ABSENTEE_OWNER_VIC'
  ],
  'vehicle': [
    'VEHICLE_REGO_NSW', 'VEHICLE_REGO_VIC', 'VEHICLE_REGO_QLD',
    'VEHICLE_REGO_SA', 'VEHICLE_REGO_WA', 'VEHICLE_REGO_TAS',
    'VEHICLE_REGO_NT', 'VEHICLE_REGO_ACT',
    'STAMP_DUTY_VEHICLE_NSW', 'STAMP_DUTY_VEHICLE_VIC',
    'STAMP_DUTY_VEHICLE_QLD', 'STAMP_DUTY_VEHICLE_SA',
    'STAMP_DUTY_VEHICLE_WA', 'STAMP_DUTY_VEHICLE_TAS',
    'STAMP_DUTY_VEHICLE_NT', 'STAMP_DUTY_VEHICLE_ACT'
  ],
  'industry': [
    'MINING_ROYALTIES_NSW', 'MINING_ROYALTIES_VIC', 'MINING_ROYALTIES_QLD',
    'MINING_ROYALTIES_SA', 'MINING_ROYALTIES_WA', 'MINING_ROYALTIES_TAS',
    'MINING_ROYALTIES_NT', 'GAMING_TAX_NSW', 'GAMING_TAX_VIC',
    'GAMING_TAX_QLD', 'GAMING_TAX_SA', 'GAMING_TAX_WA',
    'GAMING_TAX_TAS', 'GAMING_TAX_NT', 'GAMING_TAX_ACT',
    'ENVIRONMENTAL_LEVY', 'WASTE_LEVY'
  ]
};