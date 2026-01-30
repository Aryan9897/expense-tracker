# Infrastructure (SAM)

This folder contains the AWS SAM template used to deploy the backend infrastructure.

## Files
- `template.yaml`: SAM template (no secrets included).

## Deployment (local machine)
From the repo root:

```bash
cd backend/infra
sam build
sam deploy --guided
```

## Parameters you will be prompted for
- `ReceiptBucketName`: Your globally unique S3 bucket name.
- `ExpenseTableName`: Defaults to `Expenses`.
- `UploadPrefix`: Defaults to `uploads/`.
- `MaxLambdaConcurrency`: Default `2` (cost guardrail).

## Notes on secrets
- Do not hardcode secrets in `template.yaml`.
- Store secrets in `.env` for local development only, and keep `.env` in `.gitignore`.
