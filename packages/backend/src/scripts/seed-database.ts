import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { ATOScraper } from '../scrapers/ato.scraper.js';
import { deadlineValidator } from '../utils/validation.js';
import type { Deadline } from '../types/deadline.js';

const TABLE_NAME = process.env.TABLE_NAME || 'complical-deadlines-dev';
const REGION = process.env.AWS_REGION || 'ap-south-1';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

interface DynamoDBItem extends Deadline {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
}

function createDynamoDBItem(deadline: Deadline): DynamoDBItem {
  const dateObj = new Date(deadline.dueDate);
  const yearMonth = deadline.dueDate.substring(0, 7); // YYYY-MM
  
  return {
    ...deadline,
    PK: `DEADLINE#${deadline.type}`,
    SK: `${deadline.jurisdiction}#${deadline.dueDate}#${deadline.id}`,
    GSI1PK: `JURISDICTION#${deadline.jurisdiction}`,
    GSI1SK: `${deadline.dueDate}#${deadline.type}`,
    GSI2PK: `DATE#${yearMonth}`,
    GSI2SK: `${deadline.dueDate}#${deadline.type}#${deadline.id}`,
  };
}

async function batchWriteItems(items: DynamoDBItem[]): Promise<void> {
  // DynamoDB BatchWrite supports max 25 items per request
  const chunks = [];
  for (let i = 0; i < items.length; i += 25) {
    chunks.push(items.slice(i, i + 25));
  }
  
  for (const [index, chunk] of chunks.entries()) {
    console.log(`Writing batch ${index + 1}/${chunks.length} (${chunk.length} items)`);
    
    const putRequests = chunk.map(item => ({
      PutRequest: {
        Item: item,
      },
    }));
    
    try {
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: putRequests,
        },
      }));
      
      console.log(`✓ Batch ${index + 1} written successfully`);
    } catch (error) {
      console.error(`✗ Failed to write batch ${index + 1}:`, error);
      throw error;
    }
  }
}

async function seedDatabase() {
  console.log('Starting database seeding process...');
  console.log(`Target table: ${TABLE_NAME}`);
  console.log(`Region: ${REGION}`);
  
  const scraper = new ATOScraper();
  
  try {
    // Skip browser initialization for static data
    
    // Scrape deadlines (using static data)
    console.log('\n1. Scraping ATO deadlines...');
    const scrapedDeadlines = await scraper.scrapeDeadlines(true);
    console.log(`   Scraped ${scrapedDeadlines.length} deadlines`);
    
    // Validate deadlines
    console.log('\n2. Validating deadlines...');
    const { valid, invalid } = deadlineValidator.validateBatch(scrapedDeadlines);
    console.log(`   Valid: ${valid.length}`);
    console.log(`   Invalid: ${invalid.length}`);
    
    if (invalid.length > 0) {
      console.error('\n   Invalid deadlines:');
      invalid.forEach(({ data, errors }) => {
        console.error(`   - ${(data as any).id || 'unknown'}:`, errors.join(', '));
      });
    }
    
    if (valid.length === 0) {
      throw new Error('No valid deadlines to seed');
    }
    
    // Transform to DynamoDB format
    console.log('\n3. Transforming data for DynamoDB...');
    const dynamoItems = valid.map(createDynamoDBItem);
    
    // Write to DynamoDB
    console.log('\n4. Writing to DynamoDB...');
    await batchWriteItems(dynamoItems);
    
    // Summary
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`   Total items written: ${valid.length}`);
    console.log(`   Table: ${TABLE_NAME}`);
    
    // Show sample queries
    console.log('\n📊 Sample access patterns:');
    console.log('   - All deadlines by type: PK = "DEADLINE#BAS_QUARTERLY"');
    console.log('   - All AU deadlines: GSI1PK = "JURISDICTION#AU"');
    console.log('   - Deadlines for March 2024: GSI2PK = "DATE#2024-03"');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

// Run the seeding process
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}