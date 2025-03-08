const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        // 1. Check environment variables
        const dbUrl = process.env.DB_URL;
        console.log('\n1. Environment Variable Check:');
        console.log('DB_URL exists:', !!dbUrl);
        if (!dbUrl) {
            throw new Error('DB_URL is missing in environment variables');
        }
        console.log('DB_URL format:', dbUrl.replace(/:([^:@]{8})[^:@]*@/, ':****@'));
    
        // 2. Attempt connection
        console.log('\n2. Attempting MongoDB connection...');
        const conn = await mongoose.connect(dbUrl);
        
        // 3. Connection successful
        console.log('\n✅ Connection successful!');
        console.log('Connected to MongoDB version:', conn.version);
        console.log('Database name:', conn.connection.name);
        console.log('Host:', conn.connection.host);
        console.log('Port:', conn.connection.port);

        // 4. Test database operations
        console.log('\n3. Testing database operations...');
        const collections = await mongoose.connection.db.collections();
        console.log('Available collections:', collections.map(c => c.collectionName));

        // 5. Create test collection
        console.log('\n4. Testing write permissions...');
        await mongoose.connection.db.createCollection('test_collection');
        console.log('✅ Successfully created test collection');

        // 6. Remove test collection
        await mongoose.connection.db.dropCollection('test_collection');
        console.log('✅ Successfully removed test collection');

        console.log('\n✅ All tests passed successfully!');

    } catch (error) {
        console.error('\n❌ Connection Error:');
        console.error('Name:', error.name);
        console.error('Message:', error.message);
        if (error.code) console.error('Code:', error.code);
        
        // Specific error handling
        if (error.name === 'MongoServerSelectionError') {
            console.error('\nPossible issues:');
            console.error('1. MongoDB service is not running');
            console.error('2. Wrong connection string');
            console.error('3. Network connectivity issues');
            console.error('4. Firewall blocking connection');
        }

        if (error.name === 'MongoParseError') {
            console.error('\nPossible issues:');
            console.error('1. Invalid connection string format');
            console.error('2. Missing required parts in connection string');
        }

        if (error.name === 'MongooseError' && error.message.includes('authentication')) {
            console.error('\nPossible issues:');
            console.error('1. Wrong username or password');
            console.error('2. Authentication database not specified');
        }
    } finally {
        // Close connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('\nDatabase connection closed.');
        }
        process.exit();
    }
}

// Run the test
console.log('🔄 Starting MongoDB Connection Test...');
testConnection();
