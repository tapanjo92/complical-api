const crypto = require('crypto');

// The API key we're testing
const apiKey = 'oKckhppZhJ4cWGU29qFwY29h6KNqMlvF58pSJxO0';

// Calculate hash
const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

console.log('API Key:', apiKey);
console.log('Calculated Hash:', hash);
console.log('');
console.log('Hash stored in DB: 2c4a1e6a37a60e38b5d1e962eb454905aa1eb173d014752742ebe80beb8075fb');
console.log('Hashes match:', hash === '2c4a1e6a37a60e38b5d1e962eb454905aa1eb173d014752742ebe80beb8075fb');

// Let's also check if there's a different API key that would produce the stored hash
// This is just for debugging
console.log('\nDebugging info:');
console.log('API Key length:', apiKey.length);
console.log('First 8 chars (prefix):', apiKey.substring(0, 8));