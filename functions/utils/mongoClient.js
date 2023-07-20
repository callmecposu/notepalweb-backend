require('dotenv').config();

const connectToDb =  async (client, collectionName) => {
    return (await client.connect()).db('notepal').collection(collectionName);
} 

const closeClient = async (client) => {
    console.log(`Closing client..`);
    console.log(`Client status before: ${!!client.topology}`)
    await client.close();
    console.log(`Client status after: ${!!client.topology}`)
}

module.exports = { connectToDb, closeClient};