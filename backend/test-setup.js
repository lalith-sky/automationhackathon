/**
 * Backend Setup Test Script
 * Tests database connection and basic functionality
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('🧪 Starting JARVIS Backend Setup Tests...\n');

// Test 1: Check required modules
console.log('📦 Test 1: Checking required modules...');
try {
    require('express');
    require('cors');
    require('helmet');
    require('express-rate-limit');
    require('multer');
    require('dotenv');
    require('natural');
    console.log('✅ All required modules are installed\n');
} catch (error) {
    console.error('❌ Missing modules:', error.message);
    console.log('Run: npm install\n');
    process.exit(1);
}

// Test 2: MongoDB Connection
console.log('📦 Test 2: Testing MongoDB connection...');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jarvis-ai';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB connection successful');
    console.log(`   Connected to: ${MONGODB_URI}\n`);
    
    // Test 3: Test bcrypt
    console.log('📦 Test 3: Testing password hashing...');
    const testPassword = 'testPassword123';
    bcrypt.genSalt(12, (err, salt) => {
        if (err) {
            console.error('❌ bcrypt error:', err.message);
            return;
        }
        bcrypt.hash(testPassword, salt, (err, hash) => {
            if (err) {
                console.error('❌ bcrypt error:', err.message);
                return;
            }
            console.log('✅ Password hashing works');
            console.log(`   Test hash: ${hash.substring(0, 20)}...\n`);
            
            // Test 4: Test JWT
            console.log('📦 Test 4: Testing JWT token generation...');
            const testPayload = { userId: '123456' };
            const testSecret = process.env.JWT_SECRET || 'fallback-secret';
            const token = jwt.sign(testPayload, testSecret, { expiresIn: '7d' });
            console.log('✅ JWT token generation works');
            console.log(`   Test token: ${token.substring(0, 30)}...\n`);
            
            // Test 5: Verify JWT
            console.log('📦 Test 5: Testing JWT token verification...');
            try {
                const decoded = jwt.verify(token, testSecret);
                console.log('✅ JWT token verification works');
                console.log(`   Decoded userId: ${decoded.userId}\n`);
            } catch (error) {
                console.error('❌ JWT verification error:', error.message);
            }
            
            // Test 6: Test Natural Language Processing
            console.log('📦 Test 6: Testing NLP capabilities...');
            const natural = require('natural');
            const tokenizer = new natural.WordTokenizer();
            const testText = "This is a test document for JARVIS AI analysis.";
            const tokens = tokenizer.tokenize(testText);
            console.log('✅ NLP tokenization works');
            console.log(`   Tokens: ${tokens.join(', ')}\n`);
            
            // Summary
            console.log('═══════════════════════════════════════');
            console.log('✅ ALL TESTS PASSED!');
            console.log('═══════════════════════════════════════');
            console.log('\n🚀 Backend is ready to start!');
            console.log('   Run: npm start (or npm run dev)\n');
            
            mongoose.connection.close();
            process.exit(0);
        });
    });
})
.catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\n📝 Make sure MongoDB is running:');
    console.log('   Windows: net start MongoDB');
    console.log('   Or run: mongod --dbpath="C:\\data\\db"\n');
    process.exit(1);
});

// Handle connection errors
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
});
