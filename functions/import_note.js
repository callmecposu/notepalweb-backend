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
  // Try find the note to import
  const note = await notesCol.findOne({ _id: new ObjectId(body.noteID) });
  if (!note) {
    await closeClient(client);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "There is no Note with such ID" }),
    };
  }
  // Get user's notes and return error if they already have it imported
  const usersCol = await connectToDb(client, "users");
  const user = await usersCol.findOne({ username: body.username });
  var noteIDsUPD = user.noteIDs;
  if (noteIDsUPD.includes(new ObjectId(body.noteID))) {
    await closeClient(client);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "You already have this note in your Note List",
      }),
    };
  }
  // Add the note to user's noteIDs
  noteIDsUPD.push(new ObjectId(body.noteID));
  const userUPD = await usersCol.updateOne(
    { username: body.username },
    { $set: { noteIDs: noteIDsUPD } }
  );
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
