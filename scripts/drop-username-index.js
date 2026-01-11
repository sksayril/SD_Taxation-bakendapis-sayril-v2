const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string (using same config as the app)
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://kabitadas67069_db_user:kabita%4022@cluster0.vongyjy.mongodb.net/sdtaxation';

async function dropUsernameIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the employees collection
    const db = mongoose.connection.db;
    const employeesCollection = db.collection('employees');

    // Get all indexes
    const indexes = await employeesCollection.indexes();
    console.log('\nCurrent indexes on employees collection:');
    indexes.forEach(index => {
      console.log(`- ${index.name}:`, JSON.stringify(index.key, null, 2));
    });

    // Check if username index exists
    const usernameIndex = indexes.find(index => 
      index.key && index.key.username !== undefined
    );

    if (usernameIndex) {
      console.log(`\nFound username index: ${usernameIndex.name}`);
      
      // Drop the username index
      try {
        await employeesCollection.dropIndex(usernameIndex.name);
        console.log(`✅ Successfully dropped index: ${usernameIndex.name}`);
      } catch (dropError) {
        if (dropError.code === 27) {
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
    console.log('\nIndexes after cleanup:');
    indexesAfter.forEach(index => {
      console.log(`- ${index.name}:`, JSON.stringify(index.key, null, 2));
    });

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
dropUsernameIndex();

