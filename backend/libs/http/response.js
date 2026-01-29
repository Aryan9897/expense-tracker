export const jsonResponse = (statusCode, body, extraHeaders = {}) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    ...extraHeaders
  },
  body: JSON.stringify(body)
});

export const errorResponse = (statusCode, message) =>
  jsonResponse(statusCode, { error: message });
