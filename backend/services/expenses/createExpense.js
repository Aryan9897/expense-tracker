import { randomUUID } from "crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
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

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const {
      merchant,
      category,
      amount,
      date,
      status = "cleared",
      source = "manual"
    } = body || {};

    if (!merchant || !category || amount == null || !date) {
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

    const { userId: _, ...responseItem } = item;
    return jsonResponse(201, responseItem);
  } catch (err) {
    console.error("createExpense error", err);
    return errorResponse(500, "Failed to create expense");
  }
};
