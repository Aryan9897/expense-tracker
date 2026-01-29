import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { s3 } from "../../libs/s3/index.js";
import { errorResponse, jsonResponse } from "../../libs/http/response.js";

export const handler = async (event) => {
  try {
    const bucket = process.env.RECEIPT_BUCKET;
    const prefix = process.env.UPLOAD_PREFIX || "uploads/";

    if (!bucket) {
      return errorResponse(500, "Missing RECEIPT_BUCKET env var");
    }

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const contentType = body?.contentType || "image/jpeg";
    const userId = body?.userId;

    const filename = `${randomUUID()}`;
    const keyPrefix = userId ? `${prefix}${userId}/` : prefix;
    const key = `${keyPrefix}${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return jsonResponse(200, { uploadUrl, objectKey: key });
  } catch (err) {
    console.error("generateUploadUrl error", err);
    return errorResponse(500, "Failed to generate upload URL");
  }
};
