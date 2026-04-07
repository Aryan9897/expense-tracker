import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../../libs/dynamodb/index.js";
import { errorResponse, jsonResponse } from "../../libs/http/response.js";
import { verifyAuth } from "../../libs/auth/index.js";

export const handler = async (event) => {
  try {
    const tableName = process.env.EXPENSES_TABLE;
    if (!tableName) {
      console.error("Missing EXPENSES_TABLE env var");
      return errorResponse(500, "Internal server error");
    }

    const auth = await verifyAuth(event);
    if (auth.error) return auth.error;
    const { userId } = auth;

    const result = await ddb.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId
        }
      })
    );

    const items = (result.Items || []).map(({ userId, ...rest }) => rest);
    return jsonResponse(200, items);
  } catch (err) {
    console.error("listExpenses error", err);
    return errorResponse(500, "Failed to list expenses");
  }
};
