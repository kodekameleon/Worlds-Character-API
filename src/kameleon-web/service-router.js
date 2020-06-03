
export const service = {};

const methodSuccessMap = {
  "GET": 200,
  "POST": 201,
  "PUT": 200,
  "DELETE": 204,
  "HEAD": 200
};

export async function main(event) {
  try {
    event.accountId = "development";  // TODO: Need to determine the account

    if (service[event.routeKey]) {
      const res = await service[event.routeKey](event);

      // If the result is an object and has a statusCode, assume it is to be returned as is.
      if (typeof res === "object" && res.statusCode) {
        return res;
      }

      // Otherwise, construct a response with the normal response status for the method
      // and return the JSON object.
      const response = {
        statusCode: methodSuccessMap[event.requestContext.http.method] || 200,
        body: JSON.stringify(typeof res === "string" || Array.isArray(res) ? {content: res} : res),
        headers: {
          "Content-Type": "application/json"
        }
      };

      // If this was a POST, add the Location header and the id of the object
      if (event.requestContext.http.method === "POST") {
        response.headers["Location"] = `https://${event.headers.host}/${event.rawPath}/${typeof res === "string" ? res : res.id || res.uniqueId}`;
      }

      return response;
    }

    // If no handler could be found throw 404
    console.log(`Handler for router "${event.routeKey}" not found`);
    throw 404;
  } catch (err) {
    if (typeof err === "number") {
      // If the exception is a number, assume it is an HTTP error code and return it
      console.error(`Web service ${event.routeKey} returning ${err}`);
      return {
        statusCode: err
      };
    } else if (typeof err === "object" && err.httpStatusCode) {
      // Otherwise, if there is an object with a statusCode assume this is an error intended
      // for the client and return it.
      console.error(`Web service ${event.routeKey} returning ${err.statusCode} ${err.message}`);
      console.log(err);
      return {
        statusCode: err.httpStatusCode,
        body: typeof err.message === "string" ? JSON.stringify(err.message) : JSON.stringify(err)
      };
    } else {
      // All other exceptions are server exceptions, they are logged and 500 is returned.
      console.error(`Web service ${event.routeKey} returning unexpected error: `, err);
      console.log(err);
      return {
        statusCode: 500
      };
    }
  }
}

