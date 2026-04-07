import { errorResponse } from "../../libs/http/response.js";
import { verifyAuth } from "../../libs/auth/index.js";

export const handler = async (event) => {
  const auth = await verifyAuth(event);
  if (auth.error) return auth.error;

  return errorResponse(501, "AI query planner not implemented yet");
};
