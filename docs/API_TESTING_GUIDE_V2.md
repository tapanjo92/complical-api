# 🧪 CompliCal API Testing Guide v2

> Comprehensive testing examples for all 438 compliance deadlines  
> Last Updated: June 28, 2025

## 📋 Table of Contents
1. [Quick Setup](#quick-setup)
2. [Ultra-Simple Endpoint Testing](#ultra-simple-endpoint-testing)
3. [Category Testing](#category-testing)
4. [Type-Specific Testing](#type-specific-testing)
5. [Coverage Verification](#coverage-verification)
6. [Performance Testing](#performance-testing)

## 🚀 Quick Setup

```bash
# Set environment variables
export API_URL="https://lyd1qoxc01.execute-api.ap-south-1.amazonaws.com/dev"
export API_KEY="YOUR_API_KEY_HERE"

# Test connection
curl -X GET "$API_URL/health"
```

## 🎯 Ultra-Simple Endpoint Testing

### Basic Monthly Query
```bash
# Get all deadlines for July 2025
curl -X GET "$API_URL/v1/deadlines/AU/2025/7" \
  -H "x-api-key: $API_KEY" | jq '.count'
```

### Testing All Months
```bash
# Check deadline count for each month
for month in {1..12}; do
  count=$(curl -s -X GET "$API_URL/v1/deadlines/AU/2025/$month" \
    -H "x-api-key: $API_KEY" | jq '.count')
  printf "2025-%02d: %3d deadlines\n" $month $count
done
```

## 📊 Category Testing

### Test All Categories
```bash
# Loop through all categories
categories="tax payroll compliance super property vehicle industry insurance emergency"

for category in $categories; do
  echo -e "\n🏷️ Testing category: $category"
  curl -s -X GET "$API_URL/v1/deadlines/AU/2025/3?category=$category" \
    -H "x-api-key: $API_KEY" | jq '{
      category: .filters.category,
      count: .count,
      sample: .deadlines[0:2] | map({name, type})
    }'
done
```

### Vehicle Registration Testing
```bash
# Get all vehicle registrations for the year
echo "🚗 Vehicle Registration Coverage:"
for state in NSW VIC QLD SA WA TAS NT ACT; do
  count=$(curl -s -X GET "$API_URL/v1/deadlines/AU/2025/6?type=VEHICLE_REGO_$state" \
    -H "x-api-key: $API_KEY" | jq '.count')
  echo "$state: $count registration deadlines"
done
```

### Property Tax Testing
```bash
# Test property-related deadlines
echo "🏠 Property Tax Coverage:"
curl -X GET "$API_URL/v1/deadlines/AU/2025/1?category=property" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | {name, type}' | head -20
```

## 🏭 Type-Specific Testing

### Federal Excise Duties
```bash
# Test various excise duties
excise_types=(
  "FUEL_EXCISE"
  "TOBACCO_EXCISE"
  "ALCOHOL_EXCISE"
  "LUXURY_CAR_TAX"
  "WINE_EQUALISATION_TAX"
  "PETROLEUM_RESOURCE_RENT_TAX"
  "MAJOR_BANK_LEVY"
)

echo "💰 Federal Excise Testing:"
for type in "${excise_types[@]}"; do
  result=$(curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1?type=$type" \
    -H "x-api-key: $API_KEY")
  count=$(echo $result | jq '.count')
  name=$(echo $result | jq -r '.deadlines[0].name // "Not found"')
  echo "$type: $count deadline(s) - $name"
done
```

### State Stamp Duty Testing
```bash
# Test stamp duty across all states
echo "📋 Stamp Duty Coverage:"
for state in NSW VIC QLD SA WA TAS NT ACT; do
  echo -e "\n$state Stamp Duties:"
  for duty_type in PROPERTY VEHICLE INSURANCE; do
    type="STAMP_DUTY_${duty_type}_${state}"
    count=$(curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1?type=$type" \
      -H "x-api-key: $API_KEY" | jq '.count')
    [ $count -gt 0 ] && echo "  ✅ $duty_type: Found"
  done
done
```

### Gaming & Mining Testing
```bash
# Test industry-specific deadlines
echo "🎰 Gaming Tax Testing:"
curl -s -X GET "$API_URL/v1/deadlines/AU/2025/3?category=industry" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | 
  select(.type | contains("GAMING")) | {state: .type, name}'

echo -e "\n⛏️ Mining Royalties Testing:"
curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1?category=industry" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | 
  select(.type | contains("MINING")) | {state: .type, name}'
```

## 📈 Coverage Verification

### Federal vs State Distribution
```bash
# Analyze federal vs state distribution
echo "📊 Federal vs State Distribution:"

# Count federal deadlines (ATO, ASIC, etc.)
federal_count=$(curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[] | 
  select(.agency | IN("ATO", "ASIC", "FAIR_WORK", "WGEA", "AUSTRADE", "ATO_EXCISE"))' | 
  jq -s 'length')

total_count=$(curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1" \
  -H "x-api-key: $API_KEY" | jq '.count')

state_count=$((total_count - federal_count))

echo "Federal: $federal_count deadlines"
echo "State: $state_count deadlines"
echo "Total: $total_count deadlines"
```

### Agency Coverage
```bash
# List all unique agencies
echo "🏢 Agency Coverage:"
curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1" \
  -H "x-api-key: $API_KEY" | jq '.deadlines[].agency' | 
  sort | uniq -c | sort -nr
```

## ⚡ Performance Testing

### Response Time Testing
```bash
# Test response times for different queries
echo "⏱️ Response Time Testing:"

# Simple query
time curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1" \
  -H "x-api-key: $API_KEY" -o /dev/null

# Filtered query
time curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1?category=tax" \
  -H "x-api-key: $API_KEY" -o /dev/null

# Specific type query
time curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1?type=BAS_QUARTERLY" \
  -H "x-api-key: $API_KEY" -o /dev/null
```

### Load Testing
```bash
# Simple concurrent request test
echo "🔄 Concurrent Request Test (10 requests):"
for i in {1..10}; do
  curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1" \
    -H "x-api-key: $API_KEY" -o /dev/null &
done
wait
echo "Completed 10 concurrent requests"
```

## 🎁 Bonus: Complete Test Suite

```bash
#!/bin/bash
# save as test-complete-coverage.sh

echo "🧪 CompliCal Complete API Test Suite"
echo "===================================="

# Test all categories
echo -e "\n📊 Category Coverage:"
for cat in tax payroll compliance super property vehicle industry insurance emergency; do
  count=$(curl -s -X GET "$API_URL/v1/deadlines/AU/2025/3?category=$cat" \
    -H "x-api-key: $API_KEY" | jq '.count')
  printf "%-12s: %3d deadlines\n" "$cat" "$count"
done

# Test monthly distribution
echo -e "\n📅 Monthly Distribution:"
total=0
for month in {1..12}; do
  count=$(curl -s -X GET "$API_URL/v1/deadlines/AU/2025/$month" \
    -H "x-api-key: $API_KEY" | jq '.count')
  total=$((total + count))
  printf "Month %2d: %3d deadlines\n" "$month" "$count"
done
echo "Total: $total deadlines"

# Test key deadline types
echo -e "\n🔑 Key Deadline Types:"
types=("BAS_QUARTERLY" "PAYROLL_TAX_NSW" "VEHICLE_REGO_VIC" "STAMP_DUTY_PROPERTY_QLD" "GAMING_TAX_NSW")
for type in "${types[@]}"; do
  exists=$(curl -s -X GET "$API_URL/v1/deadlines/AU/2025/1?type=$type" \
    -H "x-api-key: $API_KEY" | jq '.count > 0')
  [ "$exists" = "true" ] && echo "✅ $type" || echo "❌ $type"
done

echo -e "\n✅ Test suite completed!"
```

## 📝 Notes

- Replace `YOUR_API_KEY_HERE` with your actual API key
- All examples use `jq` for JSON formatting (install with `brew install jq` or `apt-get install jq`)
- The API supports both traditional and ultra-simple endpoints
- Rate limits: 10 req/s, burst 20, 10k/month