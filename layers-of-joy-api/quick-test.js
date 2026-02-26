// quick-test.js
console.log('🚀 Starting MongoDB connection test...');
console.log('Current directory:', process.cwd());

const mongoose = require('mongoose');

// Try to connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test_db')
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB!');
    console.log('📍 Connection details:');
    console.log(`   - Host: localhost`);
    console.log(`   - Port: 27017`);
    console.log(`   - Database: test_db`);
    
    // Check if we can create a test collection
    return mongoose.connection.db.createCollection('test_collection');
  })
  .then(() => {
    console.log('✅ Successfully created test collection');
    
    // List all collections
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log('📚 Current collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    console.log('\n🎉 MongoDB is working perfectly!');
    console.log('You can now start building your API.');
    
    // Clean up - drop test collection and disconnect
    return mongoose.connection.db.dropCollection('test_collection');
  })
  .then(() => {
    console.log('✅ Test collection cleaned up');
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('👋 Disconnected from MongoDB');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure MongoDB is running');
      console.log('2. Check if MongoDB is installed');
      console.log('3. Try running "mongod" in a new terminal');
    }
  });