const { connectToDb, closeClient } = require("./utils/mongoClient");
const { MongoClient } = require ("mongodb");

exports.handler = async (event, context) => {
  // handle preflight request
  if (event.httpMethod === 'OPTIONS'){
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    }
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  const usersCol = await connectToDb(client, 'users');
  const body = JSON.parse(event.body);
  // Get user ID
  const user = await usersCol.findOne({username: body.username});
  const userID = user._id;
  var userNotes = user.noteIDs;
  // Create a note
  const notesCol = await connectToDb(client, 'notes');
  const note = await notesCol.insertOne({title: body.title, content: '', ownerID: userID});
  console.log(note);
  // Add the note to user's noteIDs
  userNotes.push(note.insertedId);
  const userUPD = await usersCol.updateOne({username: user.username}, {$set:{noteIDs: userNotes}});
  console.log(userUPD);
  await closeClient(client);
  return {
    statusCode: 200,
    headers:{
      "Access-Control-Allow-Origin": "*",
    }
  }

};
