import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../../libs/dynamodb/index.js";
import { errorResponse, jsonResponse } from "../../libs/http/response.js";

export const handler = async (event) => {
  try {
    const tableName = process.env.EXPENSES_TABLE;
    if (!tableName) {
      return errorResponse(500, "Missing EXPENSES_TABLE env var");
    }

    const userId = event?.queryStringParameters?.userId;
    if (!userId) {
      return errorResponse(400, "Missing userId");
    }

    const result = await ddb.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId
        }
      })
    );

    return jsonResponse(200, result.Items || []);
  } catch (err) {
    console.error("listExpenses error", err);
    return errorResponse(500, "Failed to list expenses");
  }
};
