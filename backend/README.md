# Backend

This folder contains the serverless backend code and configuration for the Expense Tracker MVP.

## Structure
- `services/`: Lambda handler code grouped by feature.
- `libs/`: Shared helpers organized by domain (e.g., `dynamodb/`, `s3/`, `ocr/`).
- `infra/`: Reserved for IaC templates (if you add SAM/Serverless/CDK later).

## Environment variables (local dev)
Copy `backend/.env.example` to `backend/.env` and fill in values.

## Notes
- Lambda uses IAM roles for AWS access. Do not hardcode AWS credentials in code.
- `processReceipt` expects S3 keys like `uploads/<userId>/<file>` to associate receipts with a user.
