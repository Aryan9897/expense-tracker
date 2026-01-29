import { randomUUID } from "crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../../libs/dynamodb/index.js";
import { errorResponse, jsonResponse } from "../../libs/http/response.js";

export const handler = async (event) => {
  try {
    const tableName = process.env.EXPENSES_TABLE;
    if (!tableName) {
      return errorResponse(500, "Missing EXPENSES_TABLE env var");
    }

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const {
      userId,
      merchant,
      category,
      amount,
      date,
      status = "cleared",
      source = "manual"
    } = body || {};

    if (!userId || !merchant || !category || amount == null || !date) {
      return errorResponse(400, "Missing required fields");
    }

    const item = {
      userId,
      expenseId: randomUUID(),
      merchant,
      category,
      amount,
      date,
      status,
      source,
      createdAt: new Date().toISOString()
    };

    await ddb.send(
      new PutCommand({
        TableName: tableName,
        Item: item
      })
    );

    return jsonResponse(201, item);
  } catch (err) {
    console.error("createExpense error", err);
    return errorResponse(500, "Failed to create expense");
  }
};
