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
  const usersCol = await connectToDb(client, "users");
  // Find the user to remove the note from
  const user = await usersCol.findOne({ username: body.username });
  var noteIDsUPD = user.noteIDs;
  // Replace user's noteIDs
  noteIDsUPD = noteIDsUPD.filter((elem) => elem.toString() != body.noteID);
  const res = await usersCol.updateOne(
    { username: body.username },
    { $set: { noteIDs: noteIDsUPD } }
  );
  console.log(res);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
