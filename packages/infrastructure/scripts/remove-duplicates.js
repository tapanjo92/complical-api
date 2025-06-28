#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'complical-deadlines-dev';

async function removeDuplicates() {
  console.log('🧹 Starting duplicate removal from CompliCal database...\n');
  
  let items = [];
  let lastEvaluatedKey = undefined;
  
  // Scan all items
  console.log('📥 Loading all items...');
  do {
    const scanParams = {
      TableName: TABLE_NAME,
      ExclusiveStartKey: lastEvaluatedKey
    };
    
    const response = await docClient.send(new ScanCommand(scanParams));
    items = items.concat(response.Items || []);
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  console.log(`✅ Loaded ${items.length} items\n`);
  
  // Group by type and dueDate to find duplicates
  const grouped = {};
  items.forEach(item => {
    const key = `${item.type}|${item.dueDate}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  
  // Find duplicates and decide which to keep
  const toDelete = [];
  const duplicateGroups = [];
  
  Object.entries(grouped).forEach(([key, group]) => {
    if (group.length > 1) {
      // Sort by SK to keep the most recent/complete one
      group.sort((a, b) => {
        // Prefer entries with longer, more structured SKs
        const aScore = a.SK.length + (a.SK.includes('deadline-') ? -100 : 0);
        const bScore = b.SK.length + (b.SK.includes('deadline-') ? -100 : 0);
        return bScore - aScore;
      });
      
      const keeper = group[0];
      const duplicates = group.slice(1);
      
      duplicateGroups.push({
        key,
        keeper,
        duplicates
      });
      
      toDelete.push(...duplicates);
    }
  });
  
  console.log(`🔍 Found ${duplicateGroups.length} groups with duplicates`);
  console.log(`🗑️  Will delete ${toDelete.length} duplicate entries\n`);
  
  // Show what will be deleted
  console.log('📋 Duplicates to remove:\n');
  duplicateGroups.forEach(({ key, keeper, duplicates }) => {
    const [type, date] = key.split('|');
    console.log(`${type} on ${date}:`);
    console.log(`  ✅ KEEP: ${keeper.name} (SK: ${keeper.SK})`);
    duplicates.forEach(dup => {
      console.log(`  ❌ DELETE: ${dup.name} (SK: ${dup.SK})`);
    });
    console.log();
  });
  
  // Confirm before deletion
  console.log('⚠️  This will permanently delete duplicate entries from DynamoDB!');
  console.log('📊 Database will have', items.length - toDelete.length, 'items after cleanup');
  console.log('\nProceeding with deletion in 5 seconds... (Ctrl+C to cancel)');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Delete duplicates
  console.log('\n🚀 Starting deletion...');
  let deleted = 0;
  
  for (const item of toDelete) {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: item.PK,
          SK: item.SK
        }
      }));
      deleted++;
      process.stdout.write(`\r🗑️  Deleted ${deleted}/${toDelete.length} items...`);
    } catch (error) {
      console.error(`\n❌ Error deleting item: ${item.PK} | ${item.SK}`, error);
    }
  }
  
  console.log(`\n\n✅ Successfully deleted ${deleted} duplicate entries!`);
  console.log(`📊 Database now has approximately ${items.length - deleted} unique entries`);
  
  // Generate summary report
  console.log('\n📝 Deletion Summary:');
  const typeCount = {};
  toDelete.forEach(item => {
    typeCount[item.type] = (typeCount[item.type] || 0) + 1;
  });
  
  Object.entries(typeCount).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} duplicates removed`);
  });
}

// Run deduplication
removeDuplicates()
  .then(() => {
    console.log('\n🎉 Deduplication complete!');
  })
  .catch(error => {
    console.error('\n❌ Error during deduplication:', error);
    process.exit(1);
  });