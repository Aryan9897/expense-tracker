import { AnalyzeExpenseCommand } from "@aws-sdk/client-textract";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { ddb } from "../../libs/dynamodb/index.js";
import { textract } from "../../libs/ocr/textract.js";
import { extractExpenseSummary } from "../../libs/ocr/parseExpenseSummary.js";

const getUserIdFromKey = (key, prefix) => {
  const normalized = key.startsWith(prefix) ? key.slice(prefix.length) : key;
  const parts = normalized.split("/");
  return parts.length > 1 ? parts[0] : null;
};

export const handler = async (event) => {
  const bucket = process.env.RECEIPT_BUCKET;
  const tableName = process.env.EXPENSES_TABLE;
  const prefix = process.env.UPLOAD_PREFIX || "uploads/";

  if (!bucket || !tableName) {
    console.error("Missing RECEIPT_BUCKET or EXPENSES_TABLE env var");
    return { statusCode: 500, body: "Missing env vars" };
  }

  const record = event?.Records?.[0];
  if (!record) {
    console.warn("No S3 records found");
    return { statusCode: 200, body: "No records" };
  }

  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
  const userId = getUserIdFromKey(key, prefix);

  if (!userId) {
    console.warn("No userId found in key", key);
    return { statusCode: 200, body: "Missing userId" };
  }

  try {
    const textractRes = await textract.send(
      new AnalyzeExpenseCommand({
        Document: {
          S3Object: {
            Bucket: bucket,
            Name: key
          }
        }
      })
    );

    const summary = extractExpenseSummary(textractRes);

    const item = {
      userId,
      expenseId: randomUUID(),
      source: "receipt",
      receiptKey: key,
      receiptSummary: summary,
      createdAt: new Date().toISOString()
    };

    await ddb.send(
      new PutCommand({
        TableName: tableName,
        Item: item
      })
    );

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("processReceipt error", err);
    return { statusCode: 500, body: "Failed" };
  }
};
