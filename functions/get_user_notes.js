const { connectToDb, closeClient } = require("./utils/mongoClient");
const { MongoClient } = require("mongodb");

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
  const client = new MongoClient(process.env.MONGODB_URI);
  const usersCol = await connectToDb(client, "users");
  const body = JSON.parse(event.body);
  // Get user's noteIDs
  const user = await usersCol.findOne({ username: body.username });
  console.log(user.noteIDs);
  // Get user's note objects
  const notesCol = await connectToDb(client, "notes");
  const notePromises = await user.noteIDs.map(async (noteID) => {
    const note = await notesCol.findOne({_id: noteID});
    const owner = await usersCol.findOne({_id: note.ownerID});
    note['ownerName'] = owner.username;
    return note;
  });
  const userNotes = await Promise.all(notePromises);
  await closeClient(client);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userNotes: userNotes }),
  };
};
