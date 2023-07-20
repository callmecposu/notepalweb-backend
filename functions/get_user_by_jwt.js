const { createJWT, getUser } = require("./utils/jwt");

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  }
  try {
    const body = JSON.parse(event.body);
    const result = await getUser(body.token);
    console.log(`result in the handler: ${result}`);
    return result;
  } catch (err) {
    console.log(err);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      message: err.toString(),
    };
  }
};
