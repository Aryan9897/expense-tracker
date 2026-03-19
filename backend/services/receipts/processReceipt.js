// services/receipts/processReceipt.js
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { s3 } from "../../libs/s3/index.js";
import { ddb } from "../../libs/dynamodb/index.js";
import { analyzeReceipt } from "../../libs/ocr/openrouter.js";
import { parseOcrResponse } from "../../libs/ocr/parseExpenseSummary.js";

const getUserIdFromKey = (key, prefix) => {
  const normalized = key.startsWith(prefix) ? key.slice(prefix.length) : key;
  const parts = normalized.split("/");
  return parts.length > 1 ? parts[0] : null;
};

const streamToBase64 = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("base64");
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
    // 1. Fetch image from S3
    const s3Res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const contentType = s3Res.ContentType || "image/jpeg";
    const imageBase64 = await streamToBase64(s3Res.Body);

    // 2. Analyze with OpenRouter
    const rawText = await analyzeReceipt(imageBase64, contentType);

    // 3. Parse structured fields
    const parsed = parseOcrResponse(rawText);

    // 4. Store in DynamoDB
    const item = {
      userId,
      expenseId: randomUUID(),
      source: "receipt",
      receiptKey: key,
      merchant: parsed.merchant,
      amount: parsed.amount,
      date: parsed.date,
      category: parsed.category,
      createdAt: new Date().toISOString()
    };

    await ddb.send(new PutCommand({ TableName: tableName, Item: item }));

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("processReceipt error", err);
    return { statusCode: 500, body: "Failed" };
  }
};
