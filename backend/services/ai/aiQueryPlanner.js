import { errorResponse, jsonResponse } from "../../libs/http/response.js";

export const handler = async () => {
  return errorResponse(501, "AI query planner not implemented yet");
};
