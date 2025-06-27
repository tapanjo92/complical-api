#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'complical-deadlines-dev';

// Helper function to generate unique IDs
const generateId = (jurisdiction, type, date, suffix = '') => {
  const timestamp = Date.now();
  return `${jurisdiction.toLowerCase()}-${type.toLowerCase().replace(/_/g, '-')}-${date}${suffix}-${timestamp}`;
};

// Comprehensive Australian Compliance Deadlines
const australianDeadlines = [
  // ========== FEDERAL - ATO DEADLINES ==========
  
  // BAS Quarterly (for businesses with GST turnover under $20 million)
  {
    jurisdiction: 'AU',
    type: 'BAS_QUARTERLY',
    name: 'Q2 2024-25 BAS Statement',
    description: 'Quarterly Business Activity Statement for October-December 2024',
    dueDate: '2025-02-28',
    period: '2024-Q2',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover under $20 million'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments', 'Other taxes'],
    penalties: ['General Interest Charge (GIC) applies to late payments', 'Failure to lodge on time penalty may apply'],
    notes: 'If lodging electronically, may get up to 4 extra weeks'
  },
  {
    jurisdiction: 'AU',
    type: 'BAS_QUARTERLY',
    name: 'Q3 2024-25 BAS Statement',
    description: 'Quarterly Business Activity Statement for January-March 2025',
    dueDate: '2025-04-28',
    period: '2025-Q3',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover under $20 million'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments', 'Other taxes'],
    penalties: ['General Interest Charge (GIC) applies to late payments', 'Failure to lodge on time penalty may apply'],
    notes: 'If lodging electronically, may get up to 4 extra weeks'
  },
  {
    jurisdiction: 'AU',
    type: 'BAS_QUARTERLY',
    name: 'Q4 2024-25 BAS Statement',
    description: 'Quarterly Business Activity Statement for April-June 2025',
    dueDate: '2025-07-28',
    period: '2025-Q4',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover under $20 million'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments', 'Other taxes'],
    penalties: ['General Interest Charge (GIC) applies to late payments', 'Failure to lodge on time penalty may apply'],
    notes: 'If lodging electronically, may get up to 4 extra weeks'
  },
  {
    jurisdiction: 'AU',
    type: 'BAS_QUARTERLY',
    name: 'Q1 2025-26 BAS Statement',
    description: 'Quarterly Business Activity Statement for July-September 2025',
    dueDate: '2025-10-28',
    period: '2025-Q1',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover under $20 million'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments', 'Other taxes'],
    penalties: ['General Interest Charge (GIC) applies to late payments', 'Failure to lodge on time penalty may apply'],
    notes: 'If lodging electronically, may get up to 4 extra weeks'
  },

  // BAS Monthly (for businesses with GST turnover $20 million or more)
  {
    jurisdiction: 'AU',
    type: 'BAS_MONTHLY',
    name: 'January 2025 Monthly BAS',
    description: 'Monthly Business Activity Statement for January 2025',
    dueDate: '2025-02-21',
    period: '2025-01',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover $20 million or more', 'Businesses that elect monthly reporting'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments'],
    penalties: ['General Interest Charge (GIC) applies to late payments', 'Failure to lodge on time penalty may apply'],
    notes: 'December BAS not due until 21 February'
  },
  {
    jurisdiction: 'AU',
    type: 'BAS_MONTHLY',
    name: 'February 2025 Monthly BAS',
    description: 'Monthly Business Activity Statement for February 2025',
    dueDate: '2025-03-21',
    period: '2025-02',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover $20 million or more', 'Businesses that elect monthly reporting'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments'],
    penalties: ['General Interest Charge (GIC) applies to late payments', 'Failure to lodge on time penalty may apply'],
    notes: 'Monthly lodgers must lodge and pay by 21st of following month'
  },
  {
    jurisdiction: 'AU',
    type: 'BAS_MONTHLY',
    name: 'March 2025 Monthly BAS',
    description: 'Monthly Business Activity Statement for March 2025',
    dueDate: '2025-04-21',
    period: '2025-03',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover $20 million or more', 'Businesses that elect monthly reporting'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments'],
    penalties: ['General Interest Charge (GIC) applies to late payments', 'Failure to lodge on time penalty may apply'],
    notes: 'Monthly lodgers must lodge and pay by 21st of following month'
  },
  {
    jurisdiction: 'AU',
    type: 'BAS_MONTHLY',
    name: 'April 2025 Monthly BAS',
    description: 'Monthly Business Activity Statement for April 2025',
    dueDate: '2025-05-21',
    period: '2025-04',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover $20 million or more', 'Businesses that elect monthly reporting'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments'],
    penalties: ['General Interest Charge (GIC) applies to late payments', 'Failure to lodge on time penalty may apply'],
    notes: 'Monthly lodgers must lodge and pay by 21st of following month'
  },
  {
    jurisdiction: 'AU',
    type: 'BAS_MONTHLY',
    name: 'May 2025 Monthly BAS',
    description: 'Monthly Business Activity Statement for May 2025',
    dueDate: '2025-06-21',
    period: '2025-05',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover $20 million or more', 'Businesses that elect monthly reporting'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/business-activity-statements-bas/due-dates-for-lodging-and-paying-your-bas',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments'],
    penalties: ['General Interest Charge (GIC) applies to late payments', 'Failure to lodge on time penalty may apply'],
    notes: 'Monthly lodgers must lodge and pay by 21st of following month'
  },

  // PAYG Withholding (monthly for all employers)
  {
    jurisdiction: 'AU',
    type: 'PAYG_WITHHOLDING',
    name: 'January 2025 PAYG Withholding',
    description: 'Monthly PAYG withholding for January 2025',
    dueDate: '2025-02-21',
    period: '2025-01',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers withholding tax from employees', 'Businesses paying contractors without ABN'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/payg-withholding',
    filingRequirements: ['Total tax withheld from wages', 'Voluntary agreements', 'No ABN withholding'],
    penalties: ['General Interest Charge (GIC) on late payments', 'Penalties for failing to withhold'],
    notes: 'Small withholders may be able to pay quarterly'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYG_WITHHOLDING',
    name: 'February 2025 PAYG Withholding',
    description: 'Monthly PAYG withholding for February 2025',
    dueDate: '2025-03-21',
    period: '2025-02',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers withholding tax from employees', 'Businesses paying contractors without ABN'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/payg-withholding',
    filingRequirements: ['Total tax withheld from wages', 'Voluntary agreements', 'No ABN withholding'],
    penalties: ['General Interest Charge (GIC) on late payments', 'Penalties for failing to withhold'],
    notes: 'Small withholders may be able to pay quarterly'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYG_WITHHOLDING',
    name: 'March 2025 PAYG Withholding',
    description: 'Monthly PAYG withholding for March 2025',
    dueDate: '2025-04-21',
    period: '2025-03',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers withholding tax from employees', 'Businesses paying contractors without ABN'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/payg-withholding',
    filingRequirements: ['Total tax withheld from wages', 'Voluntary agreements', 'No ABN withholding'],
    penalties: ['General Interest Charge (GIC) on late payments', 'Penalties for failing to withhold'],
    notes: 'Small withholders may be able to pay quarterly'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYG_WITHHOLDING',
    name: 'April 2025 PAYG Withholding',
    description: 'Monthly PAYG withholding for April 2025',
    dueDate: '2025-05-21',
    period: '2025-04',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers withholding tax from employees', 'Businesses paying contractors without ABN'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/payg-withholding',
    filingRequirements: ['Total tax withheld from wages', 'Voluntary agreements', 'No ABN withholding'],
    penalties: ['General Interest Charge (GIC) on late payments', 'Penalties for failing to withhold'],
    notes: 'Small withholders may be able to pay quarterly'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYG_WITHHOLDING',
    name: 'May 2025 PAYG Withholding',
    description: 'Monthly PAYG withholding for May 2025',
    dueDate: '2025-06-21',
    period: '2025-05',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers withholding tax from employees', 'Businesses paying contractors without ABN'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/payg-withholding',
    filingRequirements: ['Total tax withheld from wages', 'Voluntary agreements', 'No ABN withholding'],
    penalties: ['General Interest Charge (GIC) on late payments', 'Penalties for failing to withhold'],
    notes: 'Small withholders may be able to pay quarterly'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYG_WITHHOLDING',
    name: 'June 2025 PAYG Withholding',
    description: 'Monthly PAYG withholding for June 2025',
    dueDate: '2025-07-21',
    period: '2025-06',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers withholding tax from employees', 'Businesses paying contractors without ABN'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/payg-withholding',
    filingRequirements: ['Total tax withheld from wages', 'Voluntary agreements', 'No ABN withholding'],
    penalties: ['General Interest Charge (GIC) on late payments', 'Penalties for failing to withhold'],
    notes: 'Small withholders may be able to pay quarterly'
  },

  // Superannuation Guarantee (quarterly)
  {
    jurisdiction: 'AU',
    type: 'SUPER_GUARANTEE',
    name: 'Q2 2024-25 Super Guarantee',
    description: 'Superannuation Guarantee contributions for October-December 2024',
    dueDate: '2025-01-28',
    period: '2024-Q2',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers with eligible employees'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/paying-super-contributions/when-to-pay-super',
    filingRequirements: ['11.5% of ordinary time earnings', 'Must be received by super fund by due date'],
    penalties: ['Super guarantee charge', 'Interest', 'Admin fee of $20 per employee per quarter'],
    notes: 'Rate increases to 12% from 1 July 2025'
  },
  {
    jurisdiction: 'AU',
    type: 'SUPER_GUARANTEE',
    name: 'Q3 2024-25 Super Guarantee',
    description: 'Superannuation Guarantee contributions for January-March 2025',
    dueDate: '2025-04-28',
    period: '2025-Q3',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers with eligible employees'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/paying-super-contributions/when-to-pay-super',
    filingRequirements: ['11.5% of ordinary time earnings', 'Must be received by super fund by due date'],
    penalties: ['Super guarantee charge', 'Interest', 'Admin fee of $20 per employee per quarter'],
    notes: 'Rate increases to 12% from 1 July 2025'
  },
  {
    jurisdiction: 'AU',
    type: 'SUPER_GUARANTEE',
    name: 'Q4 2024-25 Super Guarantee',
    description: 'Superannuation Guarantee contributions for April-June 2025',
    dueDate: '2025-07-28',
    period: '2025-Q4',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers with eligible employees'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/paying-super-contributions/when-to-pay-super',
    filingRequirements: ['11.5% of ordinary time earnings', 'Must be received by super fund by due date'],
    penalties: ['Super guarantee charge', 'Interest', 'Admin fee of $20 per employee per quarter'],
    notes: 'Last quarter at 11.5% rate'
  },
  {
    jurisdiction: 'AU',
    type: 'SUPER_GUARANTEE',
    name: 'Q1 2025-26 Super Guarantee',
    description: 'Superannuation Guarantee contributions for July-September 2025',
    dueDate: '2025-10-28',
    period: '2025-Q1',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers with eligible employees'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/super-for-employers/paying-super-contributions/when-to-pay-super',
    filingRequirements: ['12% of ordinary time earnings', 'Must be received by super fund by due date'],
    penalties: ['Super guarantee charge', 'Interest', 'Admin fee of $20 per employee per quarter'],
    notes: 'First quarter at new 12% rate'
  },

  // FBT - Fringe Benefits Tax
  {
    jurisdiction: 'AU',
    type: 'FBT',
    name: '2025 FBT Annual Return',
    description: 'Fringe Benefits Tax annual return for year ending 31 March 2025',
    dueDate: '2025-05-21',
    period: '2024-25',
    agency: 'Australian Taxation Office',
    applicableTo: ['Employers providing fringe benefits to employees'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/fringe-benefits-tax',
    filingRequirements: ['Value of fringe benefits provided', 'FBT liability calculation', 'Taxable value of benefits'],
    penalties: ['General Interest Charge on late payments', 'Failure to lodge penalty'],
    notes: 'Tax agents have until 25 June 2025 to lodge'
  },
  {
    jurisdiction: 'AU',
    type: 'FBT',
    name: '2026 FBT Annual Return',
    description: 'Fringe Benefits Tax annual return for year ending 31 March 2026',
    dueDate: '2026-05-21',
    period: '2025-26',
    agency: 'Australian Taxation Office',
    applicableTo: ['Employers providing fringe benefits to employees'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/fringe-benefits-tax',
    filingRequirements: ['Value of fringe benefits provided', 'FBT liability calculation', 'Taxable value of benefits'],
    penalties: ['General Interest Charge on late payments', 'Failure to lodge penalty'],
    notes: 'Tax agents have until 25 June 2026 to lodge'
  },

  // Income Tax Returns
  {
    jurisdiction: 'AU',
    type: 'INCOME_TAX',
    name: '2024-25 Individual Tax Return',
    description: 'Individual income tax return for 2024-25 financial year',
    dueDate: '2025-10-31',
    period: '2024-25',
    agency: 'Australian Taxation Office',
    applicableTo: ['Self-lodging individuals', 'Sole traders', 'Freelancers'],
    sourceUrl: 'https://www.ato.gov.au/individuals-and-families/income-tax-returns',
    filingRequirements: ['All income sources', 'Deductions', 'Private health insurance statement'],
    penalties: ['Failure to lodge on time penalty', 'General Interest Charge on tax owed'],
    notes: 'Tax agents can lodge by 15 May 2026'
  },
  {
    jurisdiction: 'AU',
    type: 'COMPANY_TAX',
    name: '2024-25 Company Tax Return',
    description: 'Company income tax return for 2024-25 financial year',
    dueDate: '2026-02-28',
    period: '2024-25',
    agency: 'Australian Taxation Office',
    applicableTo: ['All companies required to lodge'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/income-tax-for-business/companies',
    filingRequirements: ['Financial statements', 'Tax reconciliation', 'International dealings schedule if applicable'],
    penalties: ['Failure to lodge on time penalty', 'General Interest Charge on tax owed'],
    notes: 'Earlier deadline for large/medium companies'
  },

  // PAYG Instalments
  {
    jurisdiction: 'AU',
    type: 'PAYG_INSTALMENTS',
    name: 'Q3 2024-25 PAYG Instalment',
    description: 'Pay As You Go instalment for January-March 2025',
    dueDate: '2025-04-28',
    period: '2025-Q3',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses and individuals in PAYG instalment system'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/payg-instalments',
    filingRequirements: ['Instalment amount or rate calculation', 'Business and investment income'],
    penalties: ['General Interest Charge on late payments'],
    notes: 'Can vary instalment if circumstances change'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYG_INSTALMENTS',
    name: 'Q4 2024-25 PAYG Instalment',
    description: 'Pay As You Go instalment for April-June 2025',
    dueDate: '2025-07-28',
    period: '2025-Q4',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses and individuals in PAYG instalment system'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/payg-instalments',
    filingRequirements: ['Instalment amount or rate calculation', 'Business and investment income'],
    penalties: ['General Interest Charge on late payments'],
    notes: 'Can vary instalment if circumstances change'
  },

  // Single Touch Payroll
  {
    jurisdiction: 'AU',
    type: 'STP_FINALISATION',
    name: 'STP Finalisation Declaration 2024-25',
    description: 'Single Touch Payroll finalisation for 2024-25 financial year',
    dueDate: '2025-07-14',
    period: '2024-25',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers using Single Touch Payroll'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/single-touch-payroll',
    filingRequirements: ['Finalise all employee payments', 'Make final STP submission'],
    penalties: ['Penalties for not finalising on time'],
    notes: 'Employees need this for tax returns'
  },

  // ========== FEDERAL - ASIC DEADLINES ==========
  
  // Note: ASIC deadlines are company-specific based on registration date
  // These are examples - actual dates vary by company
  {
    jurisdiction: 'AU',
    type: 'ASIC_ANNUAL_REVIEW',
    name: 'Company Annual Review - January Companies',
    description: 'Annual review for companies registered in January',
    dueDate: '2025-03-31',
    period: '2025',
    agency: 'Australian Securities and Investments Commission',
    applicableTo: ['All companies with January review date'],
    sourceUrl: 'https://asic.gov.au/for-business/running-a-company/annual-statements/',
    filingRequirements: ['Pay annual review fee', 'Update company details', 'Pass solvency resolution'],
    penalties: ['Late fee $100 (up to 1 month)', 'Risk of deregistration'],
    notes: 'Review date based on registration anniversary'
  },
  {
    jurisdiction: 'AU',
    type: 'ASIC_ANNUAL_REVIEW',
    name: 'Company Annual Review - February Companies',
    description: 'Annual review for companies registered in February',
    dueDate: '2025-04-30',
    period: '2025',
    agency: 'Australian Securities and Investments Commission',
    applicableTo: ['All companies with February review date'],
    sourceUrl: 'https://asic.gov.au/for-business/running-a-company/annual-statements/',
    filingRequirements: ['Pay annual review fee', 'Update company details', 'Pass solvency resolution'],
    penalties: ['Late fee $100 (up to 1 month)', 'Risk of deregistration'],
    notes: 'Review date based on registration anniversary'
  },
  {
    jurisdiction: 'AU',
    type: 'ASIC_ANNUAL_REVIEW',
    name: 'Company Annual Review - March Companies',
    description: 'Annual review for companies registered in March',
    dueDate: '2025-05-31',
    period: '2025',
    agency: 'Australian Securities and Investments Commission',
    applicableTo: ['All companies with March review date'],
    sourceUrl: 'https://asic.gov.au/for-business/running-a-company/annual-statements/',
    filingRequirements: ['Pay annual review fee', 'Update company details', 'Pass solvency resolution'],
    penalties: ['Late fee $100 (up to 1 month)', 'Risk of deregistration'],
    notes: 'Review date based on registration anniversary'
  },

  // ========== STATE - NSW REVENUE ==========
  
  // Payroll Tax NSW
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NSW',
    name: 'NSW Payroll Tax - January 2025',
    description: 'Monthly payroll tax return for January 2025',
    dueDate: '2025-02-07',
    period: '2025-01',
    agency: 'Revenue NSW',
    applicableTo: ['NSW employers with payroll exceeding tax-free threshold'],
    sourceUrl: 'https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/payroll-tax',
    filingRequirements: ['Total NSW wages', 'Interstate wages', 'Fringe benefits', 'Contractor payments'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Tax-free threshold $1.2 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NSW',
    name: 'NSW Payroll Tax - February 2025',
    description: 'Monthly payroll tax return for February 2025',
    dueDate: '2025-03-07',
    period: '2025-02',
    agency: 'Revenue NSW',
    applicableTo: ['NSW employers with payroll exceeding tax-free threshold'],
    sourceUrl: 'https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/payroll-tax',
    filingRequirements: ['Total NSW wages', 'Interstate wages', 'Fringe benefits', 'Contractor payments'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Tax-free threshold $1.2 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NSW',
    name: 'NSW Payroll Tax - March 2025',
    description: 'Monthly payroll tax return for March 2025',
    dueDate: '2025-04-07',
    period: '2025-03',
    agency: 'Revenue NSW',
    applicableTo: ['NSW employers with payroll exceeding tax-free threshold'],
    sourceUrl: 'https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/payroll-tax',
    filingRequirements: ['Total NSW wages', 'Interstate wages', 'Fringe benefits', 'Contractor payments'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Tax-free threshold $1.2 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NSW',
    name: 'NSW Payroll Tax - April 2025',
    description: 'Monthly payroll tax return for April 2025',
    dueDate: '2025-05-07',
    period: '2025-04',
    agency: 'Revenue NSW',
    applicableTo: ['NSW employers with payroll exceeding tax-free threshold'],
    sourceUrl: 'https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/payroll-tax',
    filingRequirements: ['Total NSW wages', 'Interstate wages', 'Fringe benefits', 'Contractor payments'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Tax-free threshold $1.2 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NSW',
    name: 'NSW Payroll Tax - May 2025',
    description: 'Monthly payroll tax return for May 2025',
    dueDate: '2025-06-10',
    period: '2025-05',
    agency: 'Revenue NSW',
    applicableTo: ['NSW employers with payroll exceeding tax-free threshold'],
    sourceUrl: 'https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/payroll-tax',
    filingRequirements: ['Total NSW wages', 'Interstate wages', 'Fringe benefits', 'Contractor payments'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Due 10 June as 7 June is weekend and 9 June is public holiday'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NSW_ANNUAL',
    name: 'NSW Payroll Tax Annual Return 2024-25',
    description: 'Annual payroll tax reconciliation return',
    dueDate: '2025-07-28',
    period: '2024-25',
    agency: 'Revenue NSW',
    applicableTo: ['All NSW registered payroll tax employers'],
    sourceUrl: 'https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/payroll-tax',
    filingRequirements: ['Annual reconciliation', 'June wages included', 'Adjustments'],
    penalties: ['Interest and penalties for late lodgment'],
    notes: 'No separate June monthly return required'
  },

  // ========== STATE - VICTORIA SRO ==========
  
  // Payroll Tax Victoria
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_VIC',
    name: 'VIC Payroll Tax - January 2025',
    description: 'Monthly payroll tax return for January 2025',
    dueDate: '2025-02-07',
    period: '2025-01',
    agency: 'State Revenue Office Victoria',
    applicableTo: ['Victorian employers with monthly payroll exceeding $75,000'],
    sourceUrl: 'https://www.sro.vic.gov.au/payroll-tax',
    filingRequirements: ['Victorian taxable wages', 'Interstate wages', 'Allowances'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Annual threshold $900,000'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_VIC',
    name: 'VIC Payroll Tax - February 2025',
    description: 'Monthly payroll tax return for February 2025',
    dueDate: '2025-03-07',
    period: '2025-02',
    agency: 'State Revenue Office Victoria',
    applicableTo: ['Victorian employers with monthly payroll exceeding $75,000'],
    sourceUrl: 'https://www.sro.vic.gov.au/payroll-tax',
    filingRequirements: ['Victorian taxable wages', 'Interstate wages', 'Allowances'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Annual threshold $900,000'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_VIC',
    name: 'VIC Payroll Tax - March 2025',
    description: 'Monthly payroll tax return for March 2025',
    dueDate: '2025-04-07',
    period: '2025-03',
    agency: 'State Revenue Office Victoria',
    applicableTo: ['Victorian employers with monthly payroll exceeding $75,000'],
    sourceUrl: 'https://www.sro.vic.gov.au/payroll-tax',
    filingRequirements: ['Victorian taxable wages', 'Interstate wages', 'Allowances'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Annual threshold $900,000'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_VIC',
    name: 'VIC Payroll Tax - April 2025',
    description: 'Monthly payroll tax return for April 2025',
    dueDate: '2025-05-07',
    period: '2025-04',
    agency: 'State Revenue Office Victoria',
    applicableTo: ['Victorian employers with monthly payroll exceeding $75,000'],
    sourceUrl: 'https://www.sro.vic.gov.au/payroll-tax',
    filingRequirements: ['Victorian taxable wages', 'Interstate wages', 'Allowances'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Annual threshold $900,000'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_VIC',
    name: 'VIC Payroll Tax - May 2025',
    description: 'Monthly payroll tax return for May 2025',
    dueDate: '2025-06-09',
    period: '2025-05',
    agency: 'State Revenue Office Victoria',
    applicableTo: ['Victorian employers with monthly payroll exceeding $75,000'],
    sourceUrl: 'https://www.sro.vic.gov.au/payroll-tax',
    filingRequirements: ['Victorian taxable wages', 'Interstate wages', 'Allowances'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Due Monday 9 June as 7 June is weekend'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_VIC_ANNUAL',
    name: 'VIC Payroll Tax Annual Reconciliation 2024-25',
    description: 'Annual payroll tax reconciliation return',
    dueDate: '2025-07-21',
    period: '2024-25',
    agency: 'State Revenue Office Victoria',
    applicableTo: ['All Victorian registered payroll tax employers'],
    sourceUrl: 'https://www.sro.vic.gov.au/payroll-tax',
    filingRequirements: ['Annual reconciliation', 'Final calculations', 'Adjustments'],
    penalties: ['Interest and penalties for late lodgment'],
    notes: 'June wages included in annual return'
  },

  // ========== STATE - QUEENSLAND ==========
  
  // Payroll Tax Queensland
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_QLD',
    name: 'QLD Payroll Tax - January 2025',
    description: 'Monthly payroll tax return for January 2025',
    dueDate: '2025-02-07',
    period: '2025-01',
    agency: 'Queensland Revenue Office',
    applicableTo: ['Queensland employers exceeding threshold'],
    sourceUrl: 'https://qro.qld.gov.au/payroll-tax/',
    filingRequirements: ['Queensland taxable wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Penalty tax and interest on late payments'],
    notes: 'Threshold $1.3 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_QLD',
    name: 'QLD Payroll Tax - February 2025',
    description: 'Monthly payroll tax return for February 2025',
    dueDate: '2025-03-07',
    period: '2025-02',
    agency: 'Queensland Revenue Office',
    applicableTo: ['Queensland employers exceeding threshold'],
    sourceUrl: 'https://qro.qld.gov.au/payroll-tax/',
    filingRequirements: ['Queensland taxable wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Penalty tax and interest on late payments'],
    notes: 'Threshold $1.3 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_QLD',
    name: 'QLD Payroll Tax - March 2025',
    description: 'Monthly payroll tax return for March 2025',
    dueDate: '2025-04-07',
    period: '2025-03',
    agency: 'Queensland Revenue Office',
    applicableTo: ['Queensland employers exceeding threshold'],
    sourceUrl: 'https://qro.qld.gov.au/payroll-tax/',
    filingRequirements: ['Queensland taxable wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Penalty tax and interest on late payments'],
    notes: 'Threshold $1.3 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_QLD',
    name: 'QLD Payroll Tax - April 2025',
    description: 'Monthly payroll tax return for April 2025',
    dueDate: '2025-05-07',
    period: '2025-04',
    agency: 'Queensland Revenue Office',
    applicableTo: ['Queensland employers exceeding threshold'],
    sourceUrl: 'https://qro.qld.gov.au/payroll-tax/',
    filingRequirements: ['Queensland taxable wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Penalty tax and interest on late payments'],
    notes: 'Threshold $1.3 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_QLD',
    name: 'QLD Payroll Tax - May 2025',
    description: 'Monthly payroll tax return for May 2025',
    dueDate: '2025-06-09',
    period: '2025-05',
    agency: 'Queensland Revenue Office',
    applicableTo: ['Queensland employers exceeding threshold'],
    sourceUrl: 'https://qro.qld.gov.au/payroll-tax/',
    filingRequirements: ['Queensland taxable wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Penalty tax and interest on late payments'],
    notes: 'Due Monday 9 June as 7 June is weekend'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_QLD_ANNUAL',
    name: 'QLD Payroll Tax Annual Return 2024-25',
    description: 'Annual payroll tax return and reconciliation',
    dueDate: '2025-07-21',
    period: '2024-25',
    agency: 'Queensland Revenue Office',
    applicableTo: ['All Queensland registered payroll tax employers'],
    sourceUrl: 'https://qro.qld.gov.au/payroll-tax/',
    filingRequirements: ['Annual reconciliation', 'June wages included'],
    penalties: ['Penalty tax and interest for late lodgment'],
    notes: 'No separate June periodic return required'
  },

  // Land Tax
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_NSW',
    name: 'NSW Land Tax Assessment 2025',
    description: 'Annual land tax assessment payment',
    dueDate: '2025-03-31',
    period: '2025',
    agency: 'Revenue NSW',
    applicableTo: ['Landowners with taxable land value exceeding threshold'],
    sourceUrl: 'https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/land-tax',
    filingRequirements: ['Pay assessed land tax', 'Update land holdings if changed'],
    penalties: ['Interest on late payments'],
    notes: 'Assessment issued in December 2024'
  },
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_VIC',
    name: 'VIC Land Tax 2025',
    description: 'Annual land tax payment',
    dueDate: '2025-05-15',
    period: '2025',
    agency: 'State Revenue Office Victoria',
    applicableTo: ['Landowners with taxable land value exceeding $300,000'],
    sourceUrl: 'https://www.sro.vic.gov.au/land-tax',
    filingRequirements: ['Pay assessed land tax', 'Notify changes in ownership'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Assessment based on 1 January land values'
  },

  // Workers Compensation
  {
    jurisdiction: 'AU',
    type: 'WORKERS_COMP_NSW',
    name: 'NSW Workers Compensation Premium 2025-26',
    description: 'Annual workers compensation insurance premium',
    dueDate: '2025-08-31',
    period: '2025-26',
    agency: 'icare NSW',
    applicableTo: ['All NSW employers'],
    sourceUrl: 'https://www.icare.nsw.gov.au/',
    filingRequirements: ['Wages declaration', 'Premium payment', 'Industry classification'],
    penalties: ['Policy cancellation', 'Penalty premiums'],
    notes: 'Premium based on wages and industry risk'
  },

  // TPAR - Taxable Payments Annual Report
  {
    jurisdiction: 'AU',
    type: 'TPAR',
    name: 'Taxable Payments Annual Report 2024-25',
    description: 'Report payments to contractors in certain industries',
    dueDate: '2025-08-28',
    period: '2024-25',
    agency: 'Australian Taxation Office',
    applicableTo: ['Building and construction', 'Cleaning', 'Courier', 'IT services', 'Security services'],
    sourceUrl: 'https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/reports-and-returns/taxable-payments-annual-report',
    filingRequirements: ['Contractor ABNs', 'Total payments including GST', 'Name and address'],
    penalties: ['Penalties for not lodging', 'Penalties for false or misleading information'],
    notes: 'Helps ATO identify contractors not declaring income'
  }
];

// Function to create proper DynamoDB items
function createDeadlineItem(deadline) {
  const id = generateId(deadline.jurisdiction, deadline.type, deadline.dueDate);
  
  return {
    PK: `DEADLINE#${deadline.jurisdiction}#${deadline.type}`,
    SK: `${deadline.dueDate}#${id}`,
    GSI1PK: `JURISDICTION#${deadline.jurisdiction}`,
    GSI1SK: deadline.dueDate,
    GSI2PK: `DATE#${deadline.dueDate.substring(0, 7)}`,
    GSI2SK: `${deadline.jurisdiction}#${deadline.type}`,
    id,
    ...deadline,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastVerified: new Date().toISOString(),
    status: 'active'
  };
}

// Function to batch write items
async function batchWriteItems(items) {
  const chunks = [];
  for (let i = 0; i < items.length; i += 25) {
    chunks.push(items.slice(i, i + 25));
  }

  for (const chunk of chunks) {
    const params = {
      RequestItems: {
        [TABLE_NAME]: chunk.map(item => ({
          PutRequest: { Item: item }
        }))
      }
    };

    try {
      await docClient.send(new BatchWriteCommand(params));
      console.log(`✓ Loaded ${chunk.length} items`);
    } catch (error) {
      console.error('Error loading batch:', error);
      throw error;
    }
  }
}

// Main function
async function loadComprehensiveAustralianData() {
  console.log('Loading comprehensive Australian compliance data...');
  console.log(`Total deadlines to load: ${australianDeadlines.length}`);

  const items = australianDeadlines.map(createDeadlineItem);
  
  await batchWriteItems(items);

  console.log(`\n✅ Successfully loaded ${australianDeadlines.length} Australian compliance deadlines!`);
  
  // Summary by type
  const summary = {};
  australianDeadlines.forEach(d => {
    summary[d.type] = (summary[d.type] || 0) + 1;
  });
  
  console.log('\nSummary by type:');
  Object.entries(summary).sort().forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

// Run the script
if (require.main === module) {
  loadComprehensiveAustralianData().catch(console.error);
}

module.exports = { loadComprehensiveAustralianData };