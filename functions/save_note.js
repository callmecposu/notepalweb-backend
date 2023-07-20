const { connectToDb, closeClient } = require("./utils/mongoClient");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

exports.handler = async (event, context) => {
  // handle preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }
  const body = JSON.parse(event.body);
  const client = new MongoClient(process.env.MONGODB_URI);
  const notesCol = await connectToDb(client, "notes");
  // Update the note in DB
  const noteUPD = await notesCol.updateOne(
    { _id: new ObjectId(body.noteID) },
    { $set: { content: body.content } }
  );
  console.log(noteUPD);
  await closeClient(client);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
