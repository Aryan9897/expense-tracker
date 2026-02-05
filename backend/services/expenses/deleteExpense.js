import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../../libs/dynamodb/index.js";
import { errorResponse, jsonResponse } from "../../libs/http/response.js";

export const handler = async (event) => {
  try {
    const tableName = process.env.EXPENSES_TABLE;
    if (!tableName) {
      return errorResponse(500, "Missing EXPENSES_TABLE env var");
    }

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const userId = body?.userId || event?.queryStringParameters?.userId;
    const expenseId = body?.expenseId || event?.queryStringParameters?.expenseId;

    if (!userId || !expenseId) {
      return errorResponse(400, "Missing userId or expenseId");
    }

    await ddb.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { userId, expenseId },
        ConditionExpression: "attribute_exists(expenseId)"
      })
    );

    return jsonResponse(200, { expenseId });
  } catch (err) {
    if (err?.name === "ConditionalCheckFailedException") {
      return errorResponse(404, "Expense not found");
    }
    console.error("deleteExpense error", err);
    return errorResponse(500, "Failed to delete expense");
  }
};
