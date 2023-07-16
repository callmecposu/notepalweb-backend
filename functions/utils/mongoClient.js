const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

const connectToDb =  async (collectionName) => {
    return (await client.connect()).db('notepal').collection(collectionName);
} 

const closeClient = async () => {
    await client.close();
}

module.exports = {connectToDb, closeClient};