import { MongoClient } from 'mongodb';
import 'dotenv/config'


const url = process.env.MONGO_URI
const dbName = "test";

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


