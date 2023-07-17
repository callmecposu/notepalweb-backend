const { connectToDb, closeClient } = require("./utils/mongoClient");
const { createJWT, getUser } = require("./utils/jwt");
const bcrypt = require("bcrypt");

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  try {
    const collection = await connectToDb("users");
    // Check if user with such username already exists
    const user = await collection.findOne({ username: body.username });
    if (user) {
      await closeClient();
      return {
        statusCode: 400,
        body: `Username "${body.username}" is already taken`,
      };
    }
    // If no such user exists, hash the password and add the user to DB
    const salt = await bcrypt.genSalt();
    const hashedPasswd = await bcrypt.hash(body.password, salt);
    const result = await collection.insertOne({
      username: body.username,
      password: hashedPasswd,
    });
    await closeClient();
    const token = createJWT(result.insertedId);
    return {
      statusCode: 200,
      body: JSON.stringify({ user: result, token: token }),
    };
  } catch (err) {
    return { statusCode: 400, body: err.toString() };
  }
};
