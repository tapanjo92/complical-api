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

// Remaining States Payroll Tax Deadlines
const remainingStatesDeadlines = [
  // ========== SOUTH AUSTRALIA - RevenueSA ==========
  
  // SA Payroll Tax Monthly
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_SA',
    name: 'SA Payroll Tax - January 2025',
    description: 'Monthly payroll tax return for January 2025',
    dueDate: '2025-02-07',
    period: '2025-01',
    agency: 'RevenueSA',
    applicableTo: ['South Australian employers exceeding threshold'],
    sourceUrl: 'https://www.revenuesa.sa.gov.au/payrolltax',
    filingRequirements: ['Total SA wages', 'Interstate wages if grouped', 'Contractor payments'],
    penalties: ['25% penalty tax', 'Market rate interest plus 8% premium'],
    notes: 'Threshold $1.5 million annually. Lodge via RevenueSA Online'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_SA',
    name: 'SA Payroll Tax - February 2025',
    description: 'Monthly payroll tax return for February 2025',
    dueDate: '2025-03-07',
    period: '2025-02',
    agency: 'RevenueSA',
    applicableTo: ['South Australian employers exceeding threshold'],
    sourceUrl: 'https://www.revenuesa.sa.gov.au/payrolltax',
    filingRequirements: ['Total SA wages', 'Interstate wages if grouped', 'Contractor payments'],
    penalties: ['25% penalty tax', 'Market rate interest plus 8% premium'],
    notes: 'Nil returns must still be lodged if no tax payable'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_SA',
    name: 'SA Payroll Tax - March 2025',
    description: 'Monthly payroll tax return for March 2025',
    dueDate: '2025-04-07',
    period: '2025-03',
    agency: 'RevenueSA',
    applicableTo: ['South Australian employers exceeding threshold'],
    sourceUrl: 'https://www.revenuesa.sa.gov.au/payrolltax',
    filingRequirements: ['Total SA wages', 'Interstate wages if grouped', 'Contractor payments'],
    penalties: ['25% penalty tax', 'Market rate interest plus 8% premium'],
    notes: 'Threshold $1.5 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_SA',
    name: 'SA Payroll Tax - April 2025',
    description: 'Monthly payroll tax return for April 2025',
    dueDate: '2025-05-07',
    period: '2025-04',
    agency: 'RevenueSA',
    applicableTo: ['South Australian employers exceeding threshold'],
    sourceUrl: 'https://www.revenuesa.sa.gov.au/payrolltax',
    filingRequirements: ['Total SA wages', 'Interstate wages if grouped', 'Contractor payments'],
    penalties: ['25% penalty tax', 'Market rate interest plus 8% premium'],
    notes: 'Threshold $1.5 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_SA',
    name: 'SA Payroll Tax - May 2025',
    description: 'Monthly payroll tax return for May 2025',
    dueDate: '2025-06-09',
    period: '2025-05',
    agency: 'RevenueSA',
    applicableTo: ['South Australian employers exceeding threshold'],
    sourceUrl: 'https://www.revenuesa.sa.gov.au/payrolltax',
    filingRequirements: ['Total SA wages', 'Interstate wages if grouped', 'Contractor payments'],
    penalties: ['25% penalty tax', 'Market rate interest plus 8% premium'],
    notes: 'Due Monday 9 June as 7 June is weekend'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_SA_ANNUAL',
    name: 'SA Payroll Tax Annual Reconciliation 2024-25',
    description: 'Annual payroll tax reconciliation return',
    dueDate: '2025-07-28',
    period: '2024-25',
    agency: 'RevenueSA',
    applicableTo: ['All SA registered payroll tax employers'],
    sourceUrl: 'https://www.revenuesa.sa.gov.au/payrolltax',
    filingRequirements: ['Annual reconciliation', 'Wage adjustments', 'June wages included'],
    penalties: ['Interest and penalties for late lodgment'],
    notes: 'Must lodge between 16 June and 28 July 2025'
  },

  // ========== WESTERN AUSTRALIA - RevenueWA ==========
  
  // WA Payroll Tax Monthly
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_WA',
    name: 'WA Payroll Tax - January 2025',
    description: 'Monthly payroll tax return for January 2025',
    dueDate: '2025-02-07',
    period: '2025-01',
    agency: 'RevenueWA',
    applicableTo: ['Western Australian employers exceeding threshold'],
    sourceUrl: 'https://www.wa.gov.au/organisation/department-of-finance/about-payroll-tax',
    filingRequirements: ['Total WA wages', 'Interstate wages', 'Contractor payments'],
    penalties: ['Penalty tax may apply', 'Interest on late payments'],
    notes: 'Threshold $1 million annually. Lodge via Revenue Online (ROL)'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_WA',
    name: 'WA Payroll Tax - February 2025',
    description: 'Monthly payroll tax return for February 2025',
    dueDate: '2025-03-07',
    period: '2025-02',
    agency: 'RevenueWA',
    applicableTo: ['Western Australian employers exceeding threshold'],
    sourceUrl: 'https://www.wa.gov.au/organisation/department-of-finance/about-payroll-tax',
    filingRequirements: ['Total WA wages', 'Interstate wages', 'Contractor payments'],
    penalties: ['Penalty tax may apply', 'Interest on late payments'],
    notes: 'Payment via CIPA, BPAY or EFT'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_WA',
    name: 'WA Payroll Tax - March 2025',
    description: 'Monthly payroll tax return for March 2025',
    dueDate: '2025-04-07',
    period: '2025-03',
    agency: 'RevenueWA',
    applicableTo: ['Western Australian employers exceeding threshold'],
    sourceUrl: 'https://www.wa.gov.au/organisation/department-of-finance/about-payroll-tax',
    filingRequirements: ['Total WA wages', 'Interstate wages', 'Contractor payments'],
    penalties: ['Penalty tax may apply', 'Interest on late payments'],
    notes: 'Threshold $1 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_WA',
    name: 'WA Payroll Tax - April 2025',
    description: 'Monthly payroll tax return for April 2025',
    dueDate: '2025-05-07',
    period: '2025-04',
    agency: 'RevenueWA',
    applicableTo: ['Western Australian employers exceeding threshold'],
    sourceUrl: 'https://www.wa.gov.au/organisation/department-of-finance/about-payroll-tax',
    filingRequirements: ['Total WA wages', 'Interstate wages', 'Contractor payments'],
    penalties: ['Penalty tax may apply', 'Interest on late payments'],
    notes: 'Threshold $1 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_WA',
    name: 'WA Payroll Tax - May 2025',
    description: 'Monthly payroll tax return for May 2025',
    dueDate: '2025-06-09',
    period: '2025-05',
    agency: 'RevenueWA',
    applicableTo: ['Western Australian employers exceeding threshold'],
    sourceUrl: 'https://www.wa.gov.au/organisation/department-of-finance/about-payroll-tax',
    filingRequirements: ['Total WA wages', 'Interstate wages', 'Contractor payments'],
    penalties: ['Penalty tax may apply', 'Interest on late payments'],
    notes: 'Due Monday 9 June as 7 June is weekend'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_WA_ANNUAL',
    name: 'WA Payroll Tax Annual Return 2024-25',
    description: 'Annual payroll tax return (June wages)',
    dueDate: '2025-07-21',
    period: '2024-25',
    agency: 'RevenueWA',
    applicableTo: ['All WA registered payroll tax employers'],
    sourceUrl: 'https://www.wa.gov.au/organisation/department-of-finance/about-payroll-tax',
    filingRequirements: ['June wages', 'Annual reconciliation'],
    penalties: ['Penalty tax and interest for late lodgment'],
    notes: 'June return due 21 July instead of regular 7th'
  },

  // ========== TASMANIA - State Revenue Office ==========
  
  // TAS Payroll Tax Monthly
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_TAS',
    name: 'TAS Payroll Tax - January 2025',
    description: 'Monthly payroll tax return for January 2025',
    dueDate: '2025-02-07',
    period: '2025-01',
    agency: 'State Revenue Office Tasmania',
    applicableTo: ['Tasmanian employers with wages exceeding $1.25 million annually'],
    sourceUrl: 'https://www.sro.tas.gov.au/payroll-tax',
    filingRequirements: ['Total Tasmanian wages', 'Interstate wages', 'Group wages'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Threshold $1.25 million or $24,038 per week. Lodge via TRO'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_TAS',
    name: 'TAS Payroll Tax - February 2025',
    description: 'Monthly payroll tax return for February 2025',
    dueDate: '2025-03-07',
    period: '2025-02',
    agency: 'State Revenue Office Tasmania',
    applicableTo: ['Tasmanian employers with wages exceeding $1.25 million annually'],
    sourceUrl: 'https://www.sro.tas.gov.au/payroll-tax',
    filingRequirements: ['Total Tasmanian wages', 'Interstate wages', 'Group wages'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Lodge via Tasmanian Revenue Online (TRO)'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_TAS',
    name: 'TAS Payroll Tax - March 2025',
    description: 'Monthly payroll tax return for March 2025',
    dueDate: '2025-04-07',
    period: '2025-03',
    agency: 'State Revenue Office Tasmania',
    applicableTo: ['Tasmanian employers with wages exceeding $1.25 million annually'],
    sourceUrl: 'https://www.sro.tas.gov.au/payroll-tax',
    filingRequirements: ['Total Tasmanian wages', 'Interstate wages', 'Group wages'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Threshold $1.25 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_TAS',
    name: 'TAS Payroll Tax - April 2025',
    description: 'Monthly payroll tax return for April 2025',
    dueDate: '2025-05-07',
    period: '2025-04',
    agency: 'State Revenue Office Tasmania',
    applicableTo: ['Tasmanian employers with wages exceeding $1.25 million annually'],
    sourceUrl: 'https://www.sro.tas.gov.au/payroll-tax',
    filingRequirements: ['Total Tasmanian wages', 'Interstate wages', 'Group wages'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Threshold $1.25 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_TAS',
    name: 'TAS Payroll Tax - May 2025',
    description: 'Monthly payroll tax return for May 2025',
    dueDate: '2025-06-09',
    period: '2025-05',
    agency: 'State Revenue Office Tasmania',
    applicableTo: ['Tasmanian employers with wages exceeding $1.25 million annually'],
    sourceUrl: 'https://www.sro.tas.gov.au/payroll-tax',
    filingRequirements: ['Total Tasmanian wages', 'Interstate wages', 'Group wages'],
    penalties: ['Interest and penalty tax on late payments'],
    notes: 'Due Monday 9 June as 7 June is weekend'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_TAS_ANNUAL',
    name: 'TAS Payroll Tax Annual Return 2024-25',
    description: 'Annual payroll tax reconciliation',
    dueDate: '2025-07-21',
    period: '2024-25',
    agency: 'State Revenue Office Tasmania',
    applicableTo: ['All Tasmanian registered payroll tax employers'],
    sourceUrl: 'https://www.sro.tas.gov.au/payroll-tax',
    filingRequirements: ['Annual reconciliation', 'June wages included'],
    penalties: ['Interest and penalties for late lodgment'],
    notes: 'Lodge via Tasmanian Revenue Online (TRO)'
  },

  // ========== NORTHERN TERRITORY - Territory Revenue Office ==========
  
  // NT Payroll Tax Monthly (Note: Many employers switching to annual from Jan 2025)
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NT',
    name: 'NT Payroll Tax - January 2025',
    description: 'Monthly payroll tax return for January 2025',
    dueDate: '2025-02-21',
    period: '2025-01',
    agency: 'Territory Revenue Office',
    applicableTo: ['NT employers with wages exceeding $1.5 million (changing to $2.5 million from July 2025)'],
    sourceUrl: 'https://treasury.nt.gov.au/dtf/territory-revenue-office/payroll-tax',
    filingRequirements: ['Total NT wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Many employers switching to annual lodgment from Jan 2025 if wages under $2.5M'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NT',
    name: 'NT Payroll Tax - February 2025',
    description: 'Monthly payroll tax return for February 2025',
    dueDate: '2025-03-21',
    period: '2025-02',
    agency: 'Territory Revenue Office',
    applicableTo: ['NT employers with wages exceeding $1.5 million'],
    sourceUrl: 'https://treasury.nt.gov.au/dtf/territory-revenue-office/payroll-tax',
    filingRequirements: ['Total NT wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Lodge via INTRA system'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NT',
    name: 'NT Payroll Tax - March 2025',
    description: 'Monthly payroll tax return for March 2025',
    dueDate: '2025-04-22',
    period: '2025-03',
    agency: 'Territory Revenue Office',
    applicableTo: ['NT employers with wages exceeding $1.5 million'],
    sourceUrl: 'https://treasury.nt.gov.au/dtf/territory-revenue-office/payroll-tax',
    filingRequirements: ['Total NT wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Due 22 April as 21 April is Easter Monday'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NT',
    name: 'NT Payroll Tax - April 2025',
    description: 'Monthly payroll tax return for April 2025',
    dueDate: '2025-05-21',
    period: '2025-04',
    agency: 'Territory Revenue Office',
    applicableTo: ['NT employers with wages exceeding $1.5 million'],
    sourceUrl: 'https://treasury.nt.gov.au/dtf/territory-revenue-office/payroll-tax',
    filingRequirements: ['Total NT wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Lodge via INTRA system'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NT',
    name: 'NT Payroll Tax - May 2025',
    description: 'Monthly payroll tax return for May 2025',
    dueDate: '2025-06-23',
    period: '2025-05',
    agency: 'Territory Revenue Office',
    applicableTo: ['NT employers with wages exceeding $1.5 million'],
    sourceUrl: 'https://treasury.nt.gov.au/dtf/territory-revenue-office/payroll-tax',
    filingRequirements: ['Total NT wages', 'Interstate wages', 'Taxable allowances'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Due 23 June as 21 June is weekend'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_NT_ANNUAL',
    name: 'NT Payroll Tax Annual Return 2024-25',
    description: 'Annual payroll tax return and reconciliation',
    dueDate: '2025-07-21',
    period: '2024-25',
    agency: 'Territory Revenue Office',
    applicableTo: ['All NT registered payroll tax employers'],
    sourceUrl: 'https://treasury.nt.gov.au/dtf/territory-revenue-office/payroll-tax',
    filingRequirements: ['Annual reconciliation', 'Pay any difference by due date'],
    penalties: ['Interest and penalty tax for late lodgment'],
    notes: 'Threshold increases to $2.5M from July 2025. Apprentice wages exempt from July 2025'
  },

  // ========== AUSTRALIAN CAPITAL TERRITORY - ACT Revenue Office ==========
  
  // ACT Payroll Tax Monthly
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_ACT',
    name: 'ACT Payroll Tax - January 2025',
    description: 'Monthly payroll tax return for January 2025',
    dueDate: '2025-02-07',
    period: '2025-01',
    agency: 'ACT Revenue Office',
    applicableTo: ['ACT employers exceeding threshold'],
    sourceUrl: 'https://www.revenue.act.gov.au/payroll-tax',
    filingRequirements: ['Total ACT wages', 'Interstate wages', 'Fringe benefits'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Threshold $2 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_ACT',
    name: 'ACT Payroll Tax - February 2025',
    description: 'Monthly payroll tax return for February 2025',
    dueDate: '2025-03-07',
    period: '2025-02',
    agency: 'ACT Revenue Office',
    applicableTo: ['ACT employers exceeding threshold'],
    sourceUrl: 'https://www.revenue.act.gov.au/payroll-tax',
    filingRequirements: ['Total ACT wages', 'Interstate wages', 'Fringe benefits'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Threshold $2 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_ACT',
    name: 'ACT Payroll Tax - March 2025',
    description: 'Monthly payroll tax return for March 2025',
    dueDate: '2025-04-07',
    period: '2025-03',
    agency: 'ACT Revenue Office',
    applicableTo: ['ACT employers exceeding threshold'],
    sourceUrl: 'https://www.revenue.act.gov.au/payroll-tax',
    filingRequirements: ['Total ACT wages', 'Interstate wages', 'Fringe benefits'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Threshold $2 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_ACT',
    name: 'ACT Payroll Tax - April 2025',
    description: 'Monthly payroll tax return for April 2025',
    dueDate: '2025-05-07',
    period: '2025-04',
    agency: 'ACT Revenue Office',
    applicableTo: ['ACT employers exceeding threshold'],
    sourceUrl: 'https://www.revenue.act.gov.au/payroll-tax',
    filingRequirements: ['Total ACT wages', 'Interstate wages', 'Fringe benefits'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Threshold $2 million annually'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_ACT',
    name: 'ACT Payroll Tax - May 2025',
    description: 'Monthly payroll tax return for May 2025',
    dueDate: '2025-06-09',
    period: '2025-05',
    agency: 'ACT Revenue Office',
    applicableTo: ['ACT employers exceeding threshold'],
    sourceUrl: 'https://www.revenue.act.gov.au/payroll-tax',
    filingRequirements: ['Total ACT wages', 'Interstate wages', 'Fringe benefits'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Due Monday 9 June as 7 June is weekend'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_ACT',
    name: 'ACT Payroll Tax - December 2024',
    description: 'Monthly payroll tax return for December 2024 (special due date)',
    dueDate: '2025-01-14',
    period: '2024-12',
    agency: 'ACT Revenue Office',
    applicableTo: ['ACT employers exceeding threshold'],
    sourceUrl: 'https://www.revenue.act.gov.au/payroll-tax',
    filingRequirements: ['Total ACT wages', 'Interstate wages', 'Fringe benefits'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Special due date for December to allow for Christmas/New Year shutdown'
  },
  {
    jurisdiction: 'AU',
    type: 'PAYROLL_TAX_ACT_ANNUAL',
    name: 'ACT Payroll Tax Annual Reconciliation 2024-25',
    description: 'Annual payroll tax reconciliation return',
    dueDate: '2025-07-28',
    period: '2024-25',
    agency: 'ACT Revenue Office',
    applicableTo: ['All ACT registered payroll tax employers'],
    sourceUrl: 'https://www.revenue.act.gov.au/payroll-tax',
    filingRequirements: ['Annual reconciliation', 'June wages included', 'Pay additional tax'],
    penalties: ['Interest and penalties for late lodgment'],
    notes: 'From July 2025: 0.5% surcharge for businesses >$50M, 1% for >$100M'
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
async function loadRemainingStatesPayroll() {
  console.log('Loading remaining states payroll tax data...');
  console.log(`Total deadlines to load: ${remainingStatesDeadlines.length}`);

  const items = remainingStatesDeadlines.map(createDeadlineItem);
  
  await batchWriteItems(items);

  console.log(`\n✅ Successfully loaded ${remainingStatesDeadlines.length} remaining states payroll tax deadlines!`);
  
  // Summary by state
  const summary = {};
  remainingStatesDeadlines.forEach(d => {
    const state = d.type.includes('_SA') ? 'SA' : 
                  d.type.includes('_WA') ? 'WA' :
                  d.type.includes('_TAS') ? 'TAS' :
                  d.type.includes('_NT') ? 'NT' :
                  d.type.includes('_ACT') ? 'ACT' : 'Unknown';
    summary[state] = (summary[state] || 0) + 1;
  });
  
  console.log('\nSummary by state:');
  Object.entries(summary).sort().forEach(([state, count]) => {
    console.log(`  ${state}: ${count} deadlines`);
  });

  // Summary by type
  const typesSummary = {};
  remainingStatesDeadlines.forEach(d => {
    const isAnnual = d.type.includes('_ANNUAL');
    const type = isAnnual ? 'Annual Returns' : 'Monthly Returns';
    typesSummary[type] = (typesSummary[type] || 0) + 1;
  });
  
  console.log('\nSummary by type:');
  Object.entries(typesSummary).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

// Run the script
if (require.main === module) {
  loadRemainingStatesPayroll().catch(console.error);
}

module.exports = { loadRemainingStatesPayroll };