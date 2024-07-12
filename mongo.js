const { MongoClient } = require('mongodb');

const url = "mongodb://localhost:27017/";
const dbName = "task-manager-db";

const client = new MongoClient(url);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    return client.db(dbName);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err; // Re-throw the error to handle it in the calling function
  }
}

async function closeMongoDBConnection() {
  try {
    await client.close();
    // console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    throw err; // Re-throw the error to handle it in the calling function
  }
}

module.exports = { connectToMongoDB, closeMongoDBConnection };
