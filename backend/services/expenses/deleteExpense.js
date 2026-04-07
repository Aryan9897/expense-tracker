import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ddb } from "../../libs/dynamodb/index.js";
import { s3 } from "../../libs/s3/index.js";
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
    const expenseId = body?.expenseId;

    if (!expenseId) {
      return errorResponse(400, "Missing expenseId");
    }

    const bucketName = process.env.RECEIPT_BUCKET;

    // Fetch the expense to check for an associated receipt
    const { Item: expense } = await ddb.send(
      new GetCommand({
        TableName: tableName,
        Key: { userId, expenseId }
      })
    );

    // Best-effort S3 receipt cleanup — if this fails, the 30-day lifecycle rule
    // on the bucket will eventually remove the orphaned object
    if (expense?.receiptKey && bucketName) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: expense.receiptKey
          })
        );
      } catch (s3Err) {
        console.warn("Best-effort S3 delete failed for", expense.receiptKey, s3Err);
      }
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
