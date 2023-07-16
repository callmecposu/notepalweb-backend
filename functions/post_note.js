const { connectToDb, closeClient } = require('./utils/mongoClient');

exports.handler = async (event, context) => {
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);
      const collection = await connectToDb('notes');
      const doc = { title: body.title, ownerId: "1111" };
      const res = await collection.insertOne(doc);
      console.log(`Inserted a doc`);
      await closeClient();
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: err.toString(),
      };
    }
  } else return{
    statusCode: 400,
    body: JSON.stringify({message: 'only POST request allowed'})
  };
};
