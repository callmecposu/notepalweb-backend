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
    if (err)
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: err.toString() }),
      };
    else {
      userID = decodedToken.userID;
    }
  });
  const collection = await connectToDb("users");
  const user = await collection.findOne({ _id: new ObjectId(userID) });
  if (user) {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ user: user }),
    };
  } else {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Invalid JWT" }),
    };
  }
};

module.exports = { createJWT, getUser };
