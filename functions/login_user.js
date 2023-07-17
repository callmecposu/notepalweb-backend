const { createJWT } = require("./utils/jwt");
const { connectToDb, closeClient } = require("./utils/mongoClient");
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
  // Try to find a user with such username
  const collection = await connectToDb("users");
  const user = await collection.findOne({ username: body.username });
  console.log(`User "${body.username}" : ${user}`);
  if (!user) {
    await closeClient();
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({message: `There is no user '${body.username}'`}),
    };
  }
  // Compare given and stored passwords
  const auth = await bcrypt.compare(body.password, user.password);
  if (!auth) {
    await closeClient();
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({message: `Invalid Password`}),
    };
  }
  // Else create a JWT for a user
  const token = createJWT(user._id.toString());
  await closeClient();
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: token , user: user}),
  };
};
