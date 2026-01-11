/**
 * Script to drop the username index from the employees collection
 * This fixes the "username already exists" error when creating employees
 * 
 * Usage: node scripts/fix-username-index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string (using same config as the app)
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://kabitadas67069_db_user:kabita%4022@cluster0.vongyjy.mongodb.net/sdtaxation';

async function fixUsernameIndex() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the employees collection
    const db = mongoose.connection.db;
    const employeesCollection = db.collection('employees');

    // Get all indexes
    console.log('📋 Checking indexes on employees collection...');
    const indexes = await employeesCollection.indexes();
    
    console.log('\nCurrent indexes:');
    indexes.forEach((index, i) => {
      const keys = Object.keys(index.key).join(', ');
      console.log(`   ${i + 1}. ${index.name}: { ${keys} }`);
    });

    // Check if username index exists
    const usernameIndex = indexes.find(index => 
      index.key && index.key.username !== undefined
    );

    if (usernameIndex) {
      console.log(`\n⚠️  Found username index: "${usernameIndex.name}"`);
      console.log('   This index is causing the "username already exists" error.');
      
      // Drop the username index
      try {
        await employeesCollection.dropIndex(usernameIndex.name);
        console.log(`✅ Successfully dropped index: "${usernameIndex.name}"`);
      } catch (dropError) {
        if (dropError.code === 27 || dropError.codeName === 'IndexNotFound') {
          console.log('⚠️  Index not found (may have already been dropped)');
        } else {
          throw dropError;
        }
      }
    } else {
      console.log('\n✅ No username index found. The collection is clean.');
    }

    // List indexes after dropping
    const indexesAfter = await employeesCollection.indexes();
    console.log('\n📋 Indexes after cleanup:');
    indexesAfter.forEach((index, i) => {
      const keys = Object.keys(index.key).join(', ');
      console.log(`   ${i + 1}. ${index.name}: { ${keys} }`);
    });

    console.log('\n✅ Done! You can now create employees without the username error.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the script
console.log('🚀 Starting username index fix script...\n');
fixUsernameIndex();

