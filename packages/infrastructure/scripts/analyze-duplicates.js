#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'complical-deadlines-dev';

async function analyzeDuplicates() {
  console.log('🔍 Analyzing duplicates in CompliCal database...\n');
  
  let items = [];
  let lastEvaluatedKey = undefined;
  
  // Scan all items
  do {
    const scanParams = {
      TableName: TABLE_NAME,
      ExclusiveStartKey: lastEvaluatedKey
    };
    
    const response = await docClient.send(new ScanCommand(scanParams));
    items = items.concat(response.Items || []);
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  console.log(`📊 Total items in database: ${items.length}\n`);
  
  // Group by type and dueDate to find duplicates
  const grouped = {};
  items.forEach(item => {
    const key = `${item.type}|${item.dueDate}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  
  // Find duplicates
  const duplicates = {};
  let totalDuplicates = 0;
  
  Object.entries(grouped).forEach(([key, group]) => {
    if (group.length > 1) {
      duplicates[key] = group;
      totalDuplicates += group.length - 1; // Count extra copies
    }
  });
  
  console.log(`🚨 Found ${Object.keys(duplicates).length} groups with duplicates`);
  console.log(`🔢 Total duplicate entries to remove: ${totalDuplicates}\n`);
  
  // Show sample duplicates
  console.log('📋 Sample duplicate groups:\n');
  let count = 0;
  for (const [key, group] of Object.entries(duplicates)) {
    if (count++ >= 10) break; // Show first 10
    
    const [type, date] = key.split('|');
    console.log(`Type: ${type}, Date: ${date}`);
    console.log(`  Found ${group.length} entries:`);
    
    group.forEach(item => {
      console.log(`    - PK: ${item.PK}, SK: ${item.SK}`);
      console.log(`      Name: ${item.name}`);
      console.log(`      ID: ${item.id}`);
    });
    console.log();
  }
  
  // Analyze SK patterns
  console.log('📐 SK Pattern Analysis:');
  const skPatterns = {};
  items.forEach(item => {
    const pattern = item.SK.includes('#') 
      ? item.SK.split('#').length + ' parts with #'
      : 'No # separator';
    skPatterns[pattern] = (skPatterns[pattern] || 0) + 1;
  });
  
  Object.entries(skPatterns).forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count} items`);
  });
  
  // Analyze PK patterns
  console.log('\n📐 PK Pattern Analysis:');
  const pkPatterns = {};
  items.forEach(item => {
    const pattern = item.PK.split('#').length === 3 ? 'DEADLINE#JURISDICTION#TYPE' : 'DEADLINE#TYPE';
    pkPatterns[pattern] = (pkPatterns[pattern] || 0) + 1;
  });
  
  Object.entries(pkPatterns).forEach(([pattern, count]) => {
    console.log(`  ${pattern}: ${count} items`);
  });
  
  return { duplicates, totalDuplicates, items };
}

// Run analysis
analyzeDuplicates()
  .then(result => {
    console.log(`\n✅ Analysis complete!`);
    console.log(`📊 Clean database would have: ${result.items.length - result.totalDuplicates} items`);
  })
  .catch(console.error);