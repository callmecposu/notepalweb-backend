const { createJWT } = require("./utils/jwt");
const { MongoClient } = require ("mongodb");
const { client, connectToDb, closeClient } = require("./utils/mongoClient");
const bcrypt = require("bcrypt");

exports.handler = async (event, context) => {
  // preflight request handler
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
  console.log(body);
  const client = new MongoClient(process.env.MONGODB_URI);
  // Try to find a user with such username
  const collection = await connectToDb(client, "users");
  const user = await collection.findOne({ username: body.username });
  console.log(`User "${body.username}" : ${user}`);
  if (!user) {
    await closeClient(client);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        src: "username",
        message: `There is no user '${body.username}'`,
      }),
    };
  }
  // Compare given and stored passwords
  const auth = await bcrypt.compare(body.password, user.password);
  if (!auth) {
    await closeClient(client);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ src: "password", message: `Invalid Password` }),
    };
  }
  // Else create a JWT for a user
  const token = createJWT(user._id.toString());
  await closeClient(client);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: token, user: user }),
  };
};
