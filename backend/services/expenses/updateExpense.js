import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../../libs/dynamodb/index.js";
import { errorResponse, jsonResponse } from "../../libs/http/response.js";
import { verifyAuth } from "../../libs/auth/index.js";

const updatableFields = ["merchant", "category", "amount", "date", "status", "source"];

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

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { expenseId, ...rest } = body || {};

    if (!expenseId) {
      return errorResponse(400, "Missing expenseId");
    }

    const updates = {};
    for (const field of updatableFields) {
      if (rest[field] !== undefined) {
        updates[field] = rest[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(400, "No fields to update");
    }

    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    const setExpressions = [];

    for (const [key, value] of Object.entries(updates)) {
      const nameKey = `#${key}`;
      const valueKey = `:${key}`;
      ExpressionAttributeNames[nameKey] = key;
      ExpressionAttributeValues[valueKey] = value;
      setExpressions.push(`${nameKey} = ${valueKey}`);
    }

    const result = await ddb.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userId, expenseId },
        UpdateExpression: `SET ${setExpressions.join(", ")}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ConditionExpression: "attribute_exists(expenseId)",
        ReturnValues: "ALL_NEW"
      })
    );

    const { userId: _, ...responseItem } = result.Attributes || {};
    return jsonResponse(200, responseItem);
  } catch (err) {
    if (err?.name === "ConditionalCheckFailedException") {
      return errorResponse(404, "Expense not found");
    }
    console.error("updateExpense error", err);
    return errorResponse(500, "Failed to update expense");
  }
};
