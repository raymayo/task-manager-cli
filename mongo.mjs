import { MongoClient } from 'mongodb';

const url = "mongodb://localhost:27017/";
const dbName = "task-manager-db";

const client = new MongoClient(url);

export async function connectToMongoDB() {
  try {
    await client.connect();
    return client.db(dbName);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err; // Re-throw the error to handle it in the calling function
  }
}

export async function closeMongoDBConnection() {
  try {
    await client.close();
    // console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    throw err; // Re-throw the error to handle it in the calling function
  }
}


