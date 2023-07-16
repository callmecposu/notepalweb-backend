const client = require('./utils/mongoClient');

exports.handler =  async (event, context) => {
    try{
        await client.connect();
        const collection = client.db('notepal').collection('notes');
        const res =  await collection.find({}).toArray();
        await client.close();
        return {
            statusCode: 200,
            body: JSON.stringify(res)
        };
    } catch(err){
        return {
            statusCode: 500,
            body: err.toString()
        };
    }
}