const { connectToDb, closeClient } = require("./utils/mongoClient");

exports.handler = async (event, context) => {
  try {
    const collection = await connectToDb("notes");
    const res = await collection.find({}).toArray();
    await closeClient();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(res),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: err.toString(),
    };
  }
};
