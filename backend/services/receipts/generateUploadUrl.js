import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { s3 } from "../../libs/s3/index.js";
import { errorResponse, jsonResponse } from "../../libs/http/response.js";
import { verifyAuth } from "../../libs/auth/index.js";

export const handler = async (event) => {
  try {
    const bucket = process.env.RECEIPT_BUCKET;
    const prefix = process.env.UPLOAD_PREFIX || "uploads/";

    if (!bucket) {
      console.error("Missing RECEIPT_BUCKET env var");
      return errorResponse(500, "Internal server error");
    }

    const auth = await verifyAuth(event);
    if (auth.error) return auth.error;
    const { userId } = auth;

    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const contentType = allowedTypes.includes(body?.contentType) ? body.contentType : "image/jpeg";

    const filename = `${randomUUID()}`;
    const key = `${prefix}${userId}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return jsonResponse(200, { uploadUrl });
  } catch (err) {
    console.error("generateUploadUrl error", err);
    return errorResponse(500, "Failed to generate upload URL");
  }
};
