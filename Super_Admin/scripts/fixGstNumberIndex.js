/**
 * Script to fix gstNumber index issue
 * Run this script once to drop and recreate the gstNumber index as sparse
 * 
 * Usage: node Super_Admin/scripts/fixGstNumberIndex.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CompanySchema = new mongoose.Schema({
  gstNumber: String
}, { collection: 'companies' });

const Company = mongoose.model('Company', CompanySchema);

async function fixGstNumberIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sdtaxation');
    console.log('Connected to MongoDB');

    // Get the collection
    const collection = mongoose.connection.db.collection('companies');

    // Drop the existing gstNumber index if it exists
    try {
      await collection.dropIndex('gstNumber_1');
      console.log('Dropped existing gstNumber_1 index');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('gstNumber_1 index does not exist, skipping drop');
      } else {
        throw error;
      }
    }

    // Create new sparse unique index
    await collection.createIndex({ gstNumber: 1 }, { unique: true, sparse: true });
    console.log('Created new sparse unique index on gstNumber');

    console.log('Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing index:', error);
    process.exit(1);
  }
}

fixGstNumberIndex();
