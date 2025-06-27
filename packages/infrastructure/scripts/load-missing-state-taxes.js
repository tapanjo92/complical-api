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

// Missing State Taxes - Land Tax and Workers Compensation
const missingStateTaxDeadlines = [
  // ========== SOUTH AUSTRALIA - Land Tax ==========
  // SA Land Tax - Individual assessments with various due dates
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_SA',
    name: 'SA Land Tax Q3 2025 Assessment',
    description: 'Land tax assessment for properties owned as at 30 June 2024',
    dueDate: '2025-03-15',
    period: '2024-25',
    agency: 'REVENUE_SA',
    applicableTo: ['Property owners with taxable land value over $723,000'],
    sourceUrl: 'https://www.revenuesa.sa.gov.au/landtax',
    filingRequirements: ['Pay assessment by due date shown on notice', 'Option for 4 instalments'],
    penalties: ['5% penalty tax', 'Interest charges at market rate plus 8% premium'],
    notes: 'Due dates vary by assessment. Can pay in 4 instalments if requested before due date'
  },
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_SA',
    name: 'SA Land Tax Q4 2025 Assessment',
    description: 'Land tax assessment for properties owned as at 30 June 2024',
    dueDate: '2025-06-15',
    period: '2024-25',
    agency: 'REVENUE_SA',
    applicableTo: ['Property owners with taxable land value over $723,000'],
    sourceUrl: 'https://www.revenuesa.sa.gov.au/landtax',
    filingRequirements: ['Pay assessment by due date shown on notice', 'Option for 4 instalments'],
    penalties: ['5% penalty tax', 'Interest charges at market rate plus 8% premium'],
    notes: 'Assessment based on ownership at midnight 30 June'
  },

  // ========== WESTERN AUSTRALIA - Land Tax ==========
  // WA Land Tax - Assessments typically sent November/December
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_WA',
    name: 'WA Land Tax 2025 Assessment',
    description: 'Annual land tax for properties owned as at 30 June 2024',
    dueDate: '2025-02-28',
    period: '2024-25',
    agency: 'REVENUE_WA',
    applicableTo: ['Property owners with combined taxable value over $300,000'],
    sourceUrl: 'https://www.wa.gov.au/organisation/department-of-finance/land-tax',
    filingRequirements: ['Pay by due date on assessment', 'Option to pay in 3 instalments'],
    penalties: ['Interest and penalty tax for late payment'],
    notes: 'Assessments sent November/December. First payment typically end of February'
  },
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_WA',
    name: 'WA Land Tax 2025 - Instalment 2',
    description: 'Second instalment for annual land tax',
    dueDate: '2025-04-30',
    period: '2024-25',
    agency: 'REVENUE_WA',
    applicableTo: ['Property owners who opted for instalment payments'],
    sourceUrl: 'https://www.wa.gov.au/organisation/department-of-finance/land-tax',
    filingRequirements: ['Pay second instalment by due date'],
    penalties: ['Cannot continue instalments if payment missed', 'Full amount becomes due'],
    notes: 'Only for those who chose 3-instalment option'
  },
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_WA',
    name: 'WA Land Tax 2025 - Instalment 3',
    description: 'Final instalment for annual land tax',
    dueDate: '2025-06-30',
    period: '2024-25',
    agency: 'REVENUE_WA',
    applicableTo: ['Property owners who opted for instalment payments'],
    sourceUrl: 'https://www.wa.gov.au/organisation/department-of-finance/land-tax',
    filingRequirements: ['Pay final instalment by due date'],
    penalties: ['Interest and penalty tax for late payment'],
    notes: 'Final instalment for 3-payment option'
  },

  // ========== TASMANIA - Land Tax ==========
  // TAS Land Tax - Assessed on 1 July each year
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_TAS',
    name: 'TAS Land Tax 2025-26 Assessment',
    description: 'Annual land tax for properties owned as at 1 July 2025',
    dueDate: '2025-09-30',
    period: '2025-26',
    agency: 'SRO_TAS',
    applicableTo: ['Property owners with land value over $124,999.99'],
    sourceUrl: 'https://www.sro.tas.gov.au/land-tax',
    filingRequirements: ['Pay by due date on assessment notice', 'Payment arrangements available'],
    penalties: ['Penalties for late payment', 'Interest charges may apply'],
    notes: 'New threshold $125,000 from 1 July 2024. Assessment based on 1 July ownership'
  },
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_TAS',
    name: 'TAS Land Tax 2024-25 Final Payments',
    description: 'Final payments for 2024-25 land tax assessments',
    dueDate: '2025-03-31',
    period: '2024-25',
    agency: 'SRO_TAS',
    applicableTo: ['Property owners with outstanding land tax'],
    sourceUrl: 'https://www.sro.tas.gov.au/land-tax',
    filingRequirements: ['Complete payment of 2024-25 assessment'],
    penalties: ['Penalties and interest for overdue amounts'],
    notes: 'For payment arrangements made on 2024-25 assessments'
  },

  // ========== NORTHERN TERRITORY - No Land Tax ==========
  // NT does not have land tax - this is a placeholder entry for completeness
  
  // ========== AUSTRALIAN CAPITAL TERRITORY - Land Tax ==========
  // ACT Land Tax - Quarterly assessments
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_ACT',
    name: 'ACT Land Tax Q1 2025 Assessment',
    description: 'Quarterly land tax assessment for January 2025',
    dueDate: '2025-02-14',
    period: '2025-Q1',
    agency: 'ACT_REVENUE',
    applicableTo: ['Property owners - investment and commercial properties'],
    sourceUrl: 'https://www.revenue.act.gov.au/land-tax',
    filingRequirements: ['Pay quarterly assessment', 'Update if property use changes'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Assessed quarterly on 1 Jan, 1 Apr, 1 Jul, 1 Oct'
  },
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_ACT',
    name: 'ACT Land Tax Q2 2025 Assessment',
    description: 'Quarterly land tax assessment for April 2025',
    dueDate: '2025-05-14',
    period: '2025-Q2',
    agency: 'ACT_REVENUE',
    applicableTo: ['Property owners - investment and commercial properties'],
    sourceUrl: 'https://www.revenue.act.gov.au/land-tax',
    filingRequirements: ['Pay quarterly assessment', 'Update if property use changes'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Assessment date 1 April 2025'
  },
  {
    jurisdiction: 'AU',
    type: 'LAND_TAX_ACT',
    name: 'ACT Land Tax Q3 2025 Assessment',
    description: 'Quarterly land tax assessment for July 2025',
    dueDate: '2025-08-14',
    period: '2025-Q3',
    agency: 'ACT_REVENUE',
    applicableTo: ['Property owners - investment and commercial properties'],
    sourceUrl: 'https://www.revenue.act.gov.au/land-tax',
    filingRequirements: ['Pay quarterly assessment', 'Update if property use changes'],
    penalties: ['Interest on late payments', 'Penalty tax may apply'],
    notes: 'Assessment date 1 July 2025'
  },

  // ========== WORKERS COMPENSATION ==========
  
  // SA Workers Compensation - ReturnToWorkSA
  {
    jurisdiction: 'AU',
    type: 'WORKERS_COMP_SA',
    name: 'SA Workers Comp Remuneration Return 2025',
    description: 'Annual employer remuneration return for 2025-26 premium calculation',
    dueDate: '2025-09-15',
    period: '2025-26',
    agency: 'RETURN_TO_WORK_SA',
    applicableTo: ['All SA employers with workers compensation insurance'],
    sourceUrl: 'https://www.rtwsa.com/',
    filingRequirements: ['Submit remuneration return', 'Report actual wages paid'],
    penalties: ['Estimated premium if not lodged', 'Late lodgment penalties'],
    notes: 'Required to calculate 2025-26 premium. Self-insured due 31 July'
  },
  {
    jurisdiction: 'AU',
    type: 'WORKERS_COMP_SA',
    name: 'SA Workers Comp Annual Premium 2025-26',
    description: 'Annual workers compensation insurance premium payment',
    dueDate: '2025-09-30',
    period: '2025-26',
    agency: 'RETURN_TO_WORK_SA',
    applicableTo: ['All SA employers with workers compensation insurance'],
    sourceUrl: 'https://www.rtwsa.com/',
    filingRequirements: ['Pay annual premium', 'Or arrange payment plan'],
    penalties: ['Interest if not paid within one month'],
    notes: 'Premium rate schedule provided at end of financial year'
  },

  // WA Workers Compensation - WorkCover WA
  {
    jurisdiction: 'AU',
    type: 'WORKERS_COMP_WA',
    name: 'WA Workers Comp Premium 2025-26',
    description: 'Annual workers compensation insurance premium',
    dueDate: '2025-08-31',
    period: '2025-26',
    agency: 'WORKCOVER_WA',
    applicableTo: ['All WA employers - compulsory insurance'],
    sourceUrl: 'https://www.workcover.wa.gov.au/',
    filingRequirements: ['Renew policy before expiry', 'Pay premium to insurer'],
    penalties: ['Operating without insurance is illegal', 'Personal liability for claims'],
    notes: 'Premium set by individual insurers. Average rate 1.732% for 2024-25'
  },

  // TAS Workers Compensation - WorkCover Tasmania
  {
    jurisdiction: 'AU',
    type: 'WORKERS_COMP_TAS',
    name: 'TAS Workers Comp Annual Premium 2025-26',
    description: 'Annual workers compensation insurance premium renewal',
    dueDate: '2025-07-31',
    period: '2025-26',
    agency: 'WORKCOVER_TAS',
    applicableTo: ['All Tasmanian employers with workers'],
    sourceUrl: 'https://worksafe.tas.gov.au/',
    filingRequirements: ['Renew policy with licensed insurer', 'Update wage declarations'],
    penalties: ['Personal liability for claims if uninsured', 'Prosecution possible'],
    notes: 'No minimum wage threshold - all employers must have coverage'
  },

  // NT Workers Compensation - NT WorkSafe
  {
    jurisdiction: 'AU',
    type: 'WORKERS_COMP_NT',
    name: 'NT Workers Comp Premium Payment',
    description: 'Workers compensation insurance premium - varies by insurer',
    dueDate: '2025-08-31',
    period: '2025-26',
    agency: 'NT_WORKSAFE',
    applicableTo: ['All NT employers with workers'],
    sourceUrl: 'https://worksafe.nt.gov.au/',
    filingRequirements: ['Pay within one month of premium notice', 'Maintain continuous coverage'],
    penalties: ['Interest on late payment', 'Up to $179,000 fine for no insurance'],
    notes: 'Premium dates set by individual insurers. NT WorkSafe can order business closure'
  },

  // ACT Workers Compensation - WorkSafe ACT
  {
    jurisdiction: 'AU',
    type: 'WORKERS_COMP_ACT',
    name: 'ACT Workers Comp Insurance Renewal 2025-26',
    description: 'Annual workers compensation insurance renewal',
    dueDate: '2025-07-31',
    period: '2025-26',
    agency: 'WORKSAFE_ACT',
    applicableTo: ['All ACT private sector employers'],
    sourceUrl: 'https://www.worksafe.act.gov.au/',
    filingRequirements: ['Maintain active policy', 'Submit monthly data to WorkSafe ACT'],
    penalties: ['Double premium recovery for non-compliance', 'Infringement notices'],
    notes: 'Privately underwritten - contact your insurer for specific dates'
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
async function loadMissingStateTaxes() {
  console.log('Loading missing state taxes (Land Tax & Workers Compensation)...');
  console.log(`Total deadlines to load: ${missingStateTaxDeadlines.length}`);

  const items = missingStateTaxDeadlines.map(createDeadlineItem);
  
  await batchWriteItems(items);

  console.log(`\n✅ Successfully loaded ${missingStateTaxDeadlines.length} missing state tax deadlines!`);
  
  // Summary by type
  const summary = {
    landTax: {},
    workersComp: {}
  };
  
  missingStateTaxDeadlines.forEach(d => {
    if (d.type.includes('LAND_TAX')) {
      const state = d.type.replace('LAND_TAX_', '');
      summary.landTax[state] = (summary.landTax[state] || 0) + 1;
    } else if (d.type.includes('WORKERS_COMP')) {
      const state = d.type.replace('WORKERS_COMP_', '');
      summary.workersComp[state] = (summary.workersComp[state] || 0) + 1;
    }
  });
  
  console.log('\nLand Tax Summary:');
  Object.entries(summary.landTax).sort().forEach(([state, count]) => {
    console.log(`  ${state}: ${count} deadlines`);
  });
  console.log(`  Note: NT has no land tax`);
  
  console.log('\nWorkers Compensation Summary:');
  Object.entries(summary.workersComp).sort().forEach(([state, count]) => {
    console.log(`  ${state}: ${count} deadlines`);
  });
}

// Run the script
if (require.main === module) {
  loadMissingStateTaxes().catch(console.error);
}

module.exports = { loadMissingStateTaxes };