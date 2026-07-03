require('dotenv').config();
const mongoose = require('mongoose');

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const result = await db.collection('testCollection').insertOne({
      message: 'MongoDB Atlas test',
      createdAt: new Date()
    });

    console.log('Inserted document ID:', result.insertedId);
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Connection test failed:', error.message);
    process.exit(1);
  }
};

runTest();
