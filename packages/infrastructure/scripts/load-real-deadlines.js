#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'complical-deadlines-dev';

// Australian Deadlines for 2025
const australianDeadlines = [
  // BAS Quarterly
  {
    jurisdiction: 'AU',
    type: 'BAS_QUARTERLY',
    name: 'Q3 2025 BAS Statement',
    description: 'Quarterly Business Activity Statement for January-March 2025',
    dueDate: '2025-04-28',
    period: '2025-Q3',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover under $20 million'],
    sourceUrl: 'https://www.ato.gov.au/business/bus/',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments'],
    penalties: ['Interest charges apply', 'FTL penalties for repeated late lodgments'],
    notes: 'May get +2 weeks if lodging online'
  },
  {
    jurisdiction: 'AU',
    type: 'BAS_QUARTERLY',
    name: 'Q4 2025 BAS Statement',
    description: 'Quarterly Business Activity Statement for April-June 2025',
    dueDate: '2025-07-28',
    period: '2025-Q4',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover under $20 million'],
    sourceUrl: 'https://www.ato.gov.au/business/bus/',
    filingRequirements: ['GST collected and paid', 'PAYG withholding', 'PAYG instalments'],
    penalties: ['Interest charges apply', 'FTL penalties for repeated late lodgments'],
    notes: 'May get +2 weeks if lodging online'
  },
  
  // BAS Monthly
  {
    jurisdiction: 'AU',
    type: 'BAS_MONTHLY',
    name: 'July 2025 Monthly BAS',
    description: 'Monthly Business Activity Statement for July 2025',
    dueDate: '2025-08-21',
    period: '2025-07',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover $20 million or more'],
    sourceUrl: 'https://www.ato.gov.au/business/bus/',
    filingRequirements: ['GST collected and paid', 'PAYG withholding'],
    penalties: ['Interest charges apply', 'FTL penalties may apply'],
    notes: 'Mandatory monthly reporting for large businesses'
  },
  {
    jurisdiction: 'AU',
    type: 'BAS_MONTHLY',
    name: 'August 2025 Monthly BAS',
    description: 'Monthly Business Activity Statement for August 2025',
    dueDate: '2025-09-21',
    period: '2025-08',
    agency: 'Australian Taxation Office',
    applicableTo: ['Businesses with GST turnover $20 million or more'],
    sourceUrl: 'https://www.ato.gov.au/business/bus/',
    filingRequirements: ['GST collected and paid', 'PAYG withholding'],
    penalties: ['Interest charges apply', 'FTL penalties may apply'],
    notes: 'Mandatory monthly reporting for large businesses'
  },
  
  // Super Guarantee
  {
    jurisdiction: 'AU',
    type: 'SUPER_GUARANTEE',
    name: 'Q3 2025 Super Guarantee',
    description: 'Superannuation Guarantee contributions for January-March 2025',
    dueDate: '2025-04-28',
    period: '2025-Q3',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers with eligible employees'],
    sourceUrl: 'https://www.ato.gov.au/business/super-for-employers/',
    filingRequirements: ['11.5% of ordinary time earnings', 'Payment to complying super funds'],
    penalties: ['Must lodge SGC statement', 'Penalties up to 200% for non-compliance'],
    notes: 'Must be received by super fund by this date'
  },
  {
    jurisdiction: 'AU',
    type: 'SUPER_GUARANTEE',
    name: 'Q4 2025 Super Guarantee',
    description: 'Superannuation Guarantee contributions for April-June 2025',
    dueDate: '2025-07-28',
    period: '2025-Q4',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers with eligible employees'],
    sourceUrl: 'https://www.ato.gov.au/business/super-for-employers/',
    filingRequirements: ['11.5% of ordinary time earnings', 'Payment to complying super funds'],
    penalties: ['Must lodge SGC statement', 'Penalties up to 200% for non-compliance'],
    notes: 'From 1 July 2026, payday super begins'
  },
  
  // PAYG Withholding
  {
    jurisdiction: 'AU',
    type: 'PAYG_WITHHOLDING',
    name: 'July 2025 PAYG Withholding',
    description: 'Monthly PAYG withholding for July 2025',
    dueDate: '2025-08-21',
    period: '2025-07',
    agency: 'Australian Taxation Office',
    applicableTo: ['All employers withholding tax from employees'],
    sourceUrl: 'https://www.ato.gov.au/business/payg-withholding/',
    filingRequirements: ['Amounts withheld from payments', 'Payment summary reporting'],
    penalties: ['Interest charges', 'FTL penalties may apply'],
    notes: 'Due with monthly BAS on 21st of following month'
  },
  
  // Income Tax
  {
    jurisdiction: 'AU',
    type: 'INCOME_TAX',
    name: '2024-25 Individual Tax Return',
    description: 'Individual income tax return for 2024-25 financial year',
    dueDate: '2025-10-31',
    period: '2024-25',
    agency: 'Australian Taxation Office',
    applicableTo: ['Self-lodging individuals'],
    sourceUrl: 'https://www.ato.gov.au/individuals/income-tax/',
    filingRequirements: ['Complete tax return', 'Report all income', 'Claim eligible deductions'],
    penalties: ['Up to 75% penalty if ATO assesses without assistance', 'Criminal prosecution possible'],
    notes: 'Tax agent clients may have until 15 May 2025'
  },
  
  // FBT
  {
    jurisdiction: 'AU',
    type: 'FBT',
    name: '2025 FBT Annual Return',
    description: 'Fringe Benefits Tax annual return for year ending 31 March 2025',
    dueDate: '2025-06-25',
    period: '2024-25',
    agency: 'Australian Taxation Office',
    applicableTo: ['Employers providing fringe benefits to employees'],
    sourceUrl: 'https://www.ato.gov.au/business/fbt/',
    filingRequirements: ['Calculate fringe benefits provided', 'Lodge FBT return', 'Pay FBT liability'],
    penalties: ['FTL penalties and interest charges apply'],
    notes: 'Electronic lodgment via tax agent deadline'
  }
];

// New Zealand Deadlines for 2025
const newZealandDeadlines = [
  // GST Monthly
  {
    jurisdiction: 'NZ',
    type: 'GST_MONTHLY',
    name: 'July 2025 GST Return',
    description: 'Monthly GST return and payment for July 2025',
    dueDate: '2025-08-28',
    period: '2025-07',
    agency: 'Inland Revenue',
    applicableTo: ['Businesses with monthly GST filing frequency'],
    sourceUrl: 'https://www.ird.govt.nz/gst',
    filingRequirements: ['Complete GST return', 'Pay GST collected minus GST paid'],
    penalties: ['Late filing penalties', 'Interest on unpaid tax'],
    notes: '28th of the following month'
  },
  {
    jurisdiction: 'NZ',
    type: 'GST_MONTHLY',
    name: 'August 2025 GST Return',
    description: 'Monthly GST return and payment for August 2025',
    dueDate: '2025-09-28',
    period: '2025-08',
    agency: 'Inland Revenue',
    applicableTo: ['Businesses with monthly GST filing frequency'],
    sourceUrl: 'https://www.ird.govt.nz/gst',
    filingRequirements: ['Complete GST return', 'Pay GST collected minus GST paid'],
    penalties: ['Late filing penalties', 'Interest on unpaid tax'],
    notes: '28th of the following month'
  },
  
  // GST 2-Monthly
  {
    jurisdiction: 'NZ',
    type: 'GST_2MONTHLY',
    name: 'Jul-Aug 2025 GST Return',
    description: 'Two-monthly GST return for July-August 2025',
    dueDate: '2025-09-28',
    period: '2025-07/08',
    agency: 'Inland Revenue',
    applicableTo: ['Businesses with 2-monthly GST filing frequency'],
    sourceUrl: 'https://www.ird.govt.nz/gst',
    filingRequirements: ['Complete GST return', 'Pay GST for 2-month period'],
    penalties: ['Late filing penalties', 'Interest on unpaid tax'],
    notes: '28th of the month following the 2-month period'
  },
  
  // PAYE
  {
    jurisdiction: 'NZ',
    type: 'PAYE',
    name: 'July 2025 PAYE',
    description: 'PAYE deductions and employer KiwiSaver contributions for July 2025',
    dueDate: '2025-08-20',
    period: '2025-07',
    agency: 'Inland Revenue',
    applicableTo: ['Employers with gross annual PAYE + ESCT < $500,000'],
    sourceUrl: 'https://www.ird.govt.nz/employing-staff/payday-filing',
    filingRequirements: ['File employment information', 'Pay PAYE deductions', 'Pay employer KiwiSaver'],
    penalties: ['Late payment penalties', 'Interest charges'],
    notes: '20th of the following month'
  },
  {
    jurisdiction: 'NZ',
    type: 'PAYE',
    name: 'August 2025 PAYE',
    description: 'PAYE deductions and employer KiwiSaver contributions for August 2025',
    dueDate: '2025-09-20',
    period: '2025-08',
    agency: 'Inland Revenue',
    applicableTo: ['Employers with gross annual PAYE + ESCT < $500,000'],
    sourceUrl: 'https://www.ird.govt.nz/employing-staff/payday-filing',
    filingRequirements: ['File employment information', 'Pay PAYE deductions', 'Pay employer KiwiSaver'],
    penalties: ['Late payment penalties', 'Interest charges'],
    notes: '20th of the following month'
  },
  
  // Provisional Tax
  {
    jurisdiction: 'NZ',
    type: 'PROVISIONAL_TAX',
    name: 'P1 Provisional Tax 2025-26',
    description: 'First provisional tax instalment for 2025-26 tax year',
    dueDate: '2025-08-28',
    period: '2025-26',
    agency: 'Inland Revenue',
    applicableTo: ['Businesses with 31 March balance date using standard option'],
    sourceUrl: 'https://www.ird.govt.nz/income-tax/provisional-tax',
    filingRequirements: ['Pay first instalment of provisional tax'],
    penalties: ['Interest from due date', 'Late payment penalties'],
    notes: 'Standard provisional tax instalment'
  },
  
  // Income Tax
  {
    jurisdiction: 'NZ',
    type: 'IR3',
    name: '2024 Individual Tax Return',
    description: 'Individual income tax return for 2024 tax year',
    dueDate: '2025-07-07',
    period: '2024',
    agency: 'Inland Revenue',
    applicableTo: ['Individuals required to file IR3'],
    sourceUrl: 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals',
    filingRequirements: ['Complete IR3 return', 'Report all income', 'Claim expenses'],
    penalties: ['Late filing penalties', 'Interest on tax owed'],
    notes: 'Extension to 31 March 2026 if using tax agent'
  },
  
  // FBT
  {
    jurisdiction: 'NZ',
    type: 'FBT_QUARTERLY',
    name: 'Q2 2025 FBT Return',
    description: 'Quarterly FBT return for July-September 2025',
    dueDate: '2025-10-31',
    period: '2025-Q2',
    agency: 'Inland Revenue',
    applicableTo: ['Employers providing fringe benefits'],
    sourceUrl: 'https://www.ird.govt.nz/employing-staff/fbt',
    filingRequirements: ['Calculate fringe benefits', 'File FBT return', 'Pay FBT'],
    penalties: ['Late filing penalties', 'Interest charges'],
    notes: 'Important: FBT rules change from 1 April 2025'
  },
  
  // KiwiSaver
  {
    jurisdiction: 'NZ',
    type: 'KIWISAVER',
    name: 'July 2025 KiwiSaver Contributions',
    description: 'Employer KiwiSaver contributions for July 2025',
    dueDate: '2025-08-20',
    period: '2025-07',
    agency: 'Inland Revenue',
    applicableTo: ['All employers with eligible KiwiSaver members'],
    sourceUrl: 'https://www.ird.govt.nz/kiwisaver/kiwisaver-employers',
    filingRequirements: ['Minimum 3% employer contribution', 'Deduct employee contributions'],
    penalties: ['Late payment penalties', 'Interest charges'],
    notes: 'Paid together with PAYE. Default rate increases to 3.5% from April 2026'
  }
];

async function generateDeadlineId(jurisdiction, type, dueDate) {
  return `${jurisdiction}-${type}-${dueDate}-${Date.now()}`.toLowerCase();
}

async function loadDeadlines() {
  try {
    console.log('Loading real compliance deadlines into DynamoDB...');
    
    const allDeadlines = [...australianDeadlines, ...newZealandDeadlines];
    const timestamp = new Date().toISOString();
    
    // Process in batches of 25 (DynamoDB limit)
    for (let i = 0; i < allDeadlines.length; i += 25) {
      const batch = allDeadlines.slice(i, i + 25);
      const items = [];
      
      for (const deadline of batch) {
        const id = await generateDeadlineId(deadline.jurisdiction, deadline.type, deadline.dueDate);
        
        const item = {
          PutRequest: {
            Item: {
              PK: `DEADLINE#${deadline.jurisdiction}#${deadline.type}`,
              SK: `${deadline.dueDate}#${id}`,
              GSI1PK: `JURISDICTION#${deadline.jurisdiction}`,
              GSI1SK: deadline.dueDate,
              GSI2PK: `TYPE#${deadline.type}`,
              GSI2SK: deadline.dueDate,
              id,
              ...deadline,
              createdAt: timestamp,
              updatedAt: timestamp
            }
          }
        };
        
        items.push(item);
      }
      
      const params = {
        RequestItems: {
          [TABLE_NAME]: items
        }
      };
      
      const result = await docClient.send(new BatchWriteCommand(params));
      
      if (result.UnprocessedItems && Object.keys(result.UnprocessedItems).length > 0) {
        console.error('Unprocessed items:', result.UnprocessedItems);
      }
      
      console.log(`Loaded batch ${Math.floor(i/25) + 1} of ${Math.ceil(allDeadlines.length/25)}`);
    }
    
    console.log(`Successfully loaded ${allDeadlines.length} deadlines:`);
    console.log(`- Australia: ${australianDeadlines.length} deadlines`);
    console.log(`- New Zealand: ${newZealandDeadlines.length} deadlines`);
    
  } catch (error) {
    console.error('Error loading deadlines:', error);
    process.exit(1);
  }
}

// Run the loader
if (require.main === module) {
  loadDeadlines();
}

module.exports = { loadDeadlines };