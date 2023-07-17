const { createJWT } = require("./utils/jwt");
const { connectToDb, closeClient } = require("./utils/mongoClient");
const bcrypt = require('bcrypt');

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  // Try to find a user with such username
  const collection = await connectToDb("users");
  const user = await collection.findOne({ username: body.username });
  if (!user)
    return { statusCode: 400, body: `There is no user "${body.username}"` };
  // Compare given and stored passwords
  const auth = await bcrypt.compare(body.password, user.password);
  if (!auth) return {statusCode: 400, body: 'Invalid Password'};
  // Else create a JWT for a user
  const token = createJWT(user._id.toString());
  return {statusCode:200, body: JSON.stringify({token: token})};
};
