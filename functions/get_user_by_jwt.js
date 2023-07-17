const { createJWT, getUser } = require("./utils/jwt");

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const result = await getUser(body.token);
    console.log(`result in the handler: ${result}`);
    return result;
  } catch (err) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      message: err.toString(),
    };
  }
};
