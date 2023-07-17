const jwt = require("jsonwebtoken");
const { connectToDb, closeClient } = require("./mongoClient");
const { ObjectId } = require("mongodb");

const maxAge = 3 * 24 * 60 * 60;

const createJWT = (userID) => {
  return jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

const getUser = async (token) => {
  var userID;
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) return { statusCode: 400, body: err.toString() };
    else {
      userID = decodedToken.userID;
    }
  });
  const collection = await connectToDb('users');
  const user = await collection.findOne({_id: new ObjectId(userID)});
  console.log(user);
  return {statusCode:200, body: JSON.stringify(user)};
};

module.exports = { createJWT, getUser };