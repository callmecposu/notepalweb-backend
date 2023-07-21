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
  // Find all users with this note
  const usersWithNote = await usersCol.find({noteIDs: new ObjectId(body.noteID)}).toArray();
  console.log(usersWithNote)
  // Update all such users' noteIDs
  if(usersWithNote){
    const userUPDPromises = usersWithNote.map(async (user)=>{
        var noteIDsUPD = user.noteIDs.filter(noteID => noteID != body.noteID);
        const userUPD = await usersCol.updateOne({username: user.username}, {$set:{noteIDs: noteIDsUPD}});
        return userUPD;
    })
    await Promise.all(userUPDPromises);
  }
  // Delete the Note
  const notesCol = await connectToDb(client, 'notes');
  const res = await notesCol.deleteOne({_id: new ObjectId(body.noteID)});
  console.log(res);
  await closeClient(client);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
