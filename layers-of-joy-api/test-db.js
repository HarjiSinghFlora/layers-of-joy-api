// test-db.js - Simplified version
console.log('Starting test...');

try {
    // Try to load dotenv
    require('dotenv').config();
    console.log('✅ dotenv loaded');
    
    const mongoose = require('mongoose');
    console.log('✅ mongoose loaded');
    
    // Use a direct connection string (no .env file needed for this test)
    const MONGODB_URI = 'mongodb://localhost:27017/test_db';
    
    console.log('Attempting to connect to MongoDB...');
    
    mongoose.connect(MONGODB_URI)
        .then(() => {
            console.log('✅ SUCCESS! Connected to MongoDB!');
            console.log('Database:', mongoose.connection.name);
            
            // Close connection
            return mongoose.disconnect();
        })
        .then(() => {
            console.log('Disconnected from MongoDB');
        })
        .catch(err => {
            console.error('❌ Connection failed:', err.message);
        });
        
} catch (error) {
    console.error('Error:', error.message);
}