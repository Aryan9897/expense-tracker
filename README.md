# AI Expense Tracker

A personal expense tracking app with AI-powered receipt scanning and a chatbot that answers questions about your spending. Upload a photo of a receipt and the app automatically extracts the merchant, amount, date, and category. Ask the built-in chat assistant things like "How much did I spend on groceries this month?"

## Features

- **Manual expense tracking** - Add, edit, and delete expenses with merchant, category, amount, date, and status
- **Receipt scanning** - Upload a receipt photo and AI extracts the details automatically (no manual entry)
- **AI chat assistant** - Ask natural-language questions about your spending ("What's my biggest expense?", "How much did I spend last week?")
- **Authentication** - Email/password and Google sign-in via Firebase
- **User profiles** - First name, last name, email, phone number stored in Firestore
- **Custom categories** - Start with defaults (Groceries, Transport, Software, Coffee) and create your own

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, CSS Modules |
| Backend | AWS Lambda (Node.js 24), API Gateway (HTTP API) |
| Database | DynamoDB (expenses), Firestore (user profiles) |
| File Storage | AWS S3 (receipt images) |
| Auth | Firebase Authentication |
| AI / OCR | OpenRouter API (free Nvidia Nemotron models) |
| Infrastructure | AWS SAM (CloudFormation) |

## Architecture

```
Browser (React)
    |
    |-- Firebase Auth (login/signup)
    |-- Firestore (user profile read/write)
    |-- API Gateway (expense CRUD + chat)
            |
            v
      AWS Lambda Functions
            |
            |-- DynamoDB (store/query expenses)
            |-- S3 (upload/download receipts)
            |-- OpenRouter API (OCR + chat AI)
```

## Project Structure

```
AI Expense Tracker/
├── frontend/                         # React app
│   ├── src/
│   │   ├── main.tsx                  # Entry point (wraps App in AuthProvider)
│   │   ├── App.tsx                   # Main shell - routing, auth state, profile loading
│   │   ├── components/               # Reusable UI pieces
│   │   │   ├── ChatWidget.tsx        # Floating AI chat popup
│   │   │   ├── Modal.tsx             # Generic modal overlay
│   │   │   └── StatCard.tsx          # Dashboard stat display card
│   │   ├── pages/                    # Full-page views
│   │   │   ├── Dashboard.tsx         # Main view - expense list, add/edit/delete, receipt upload
│   │   │   ├── Login.tsx             # Email + Google sign-in
│   │   │   ├── Signup.tsx            # Account creation form
│   │   │   ├── Profile.tsx           # Edit name, email, phone
│   │   │   └── ChangePassword.tsx    # Update password (email/password users only)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # Firebase auth state + login/signup/logout methods
│   │   ├── services/
│   │   │   └── user.ts              # Firestore user profile read/write
│   │   ├── types/
│   │   │   └── expense.ts           # TypeScript type definitions (Expense, ExpenseTotals)
│   │   ├── lib/
│   │   │   └── firebase.ts          # Firebase SDK initialization
│   │   └── styles/
│   │       └── global.css            # Global styles, CSS variables, button classes
│   ├── .env.example                  # Template for environment variables
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                          # AWS Lambda functions
│   ├── libs/                         # Shared code used by all Lambda functions
│   │   ├── auth/index.js             # Verifies Firebase ID tokens
│   │   ├── dynamodb/index.js         # DynamoDB document client
│   │   ├── s3/index.js               # S3 client
│   │   ├── http/response.js          # JSON + error HTTP response helpers
│   │   └── ocr/
│   │       ├── openrouter.js         # Calls OpenRouter vision model for receipt analysis
│   │       └── parseExpenseSummary.js # Parses AI text response into structured data
│   ├── services/                     # Lambda handler functions (one per API endpoint)
│   │   ├── expenses/
│   │   │   ├── createExpense.js      # POST /expense
│   │   │   ├── listExpenses.js       # GET /expenses
│   │   │   ├── updateExpense.js      # PUT /expense
│   │   │   └── deleteExpense.js      # DELETE /expense
│   │   ├── receipts/
│   │   │   ├── generateUploadUrl.js  # POST /receipt/upload (returns presigned S3 URL)
│   │   │   └── processReceipt.js     # Triggered by S3 upload (OCR + save to DB)
│   │   └── ai/
│   │       └── chatHandler.js        # POST /ai/chat (expense Q&A assistant)
│   ├── infra/
│   │   └── template.yaml             # SAM/CloudFormation template (all AWS resources)
│   ├── .env.example
│   └── package.json
│
├── firestore.rules                   # Firestore security rules (users can only access own data)
└── .gitignore
```

## Prerequisites

Before setting up the project, you need accounts and tools installed on your machine.

### Accounts you need (all free)

1. **Firebase** (free tier) - [console.firebase.google.com](https://console.firebase.google.com)
   - Create a project
   - Enable **Authentication** with Email/Password and Google sign-in providers
   - Enable **Cloud Firestore** (create a database in production mode)
   - Register a **Web app** to get your Firebase config values

2. **AWS** (free tier) - [aws.amazon.com](https://aws.amazon.com)
   - Create an account (requires a credit card but won't charge for free-tier usage)
   - Make sure you have an IAM user with permissions for Lambda, DynamoDB, S3, API Gateway, CloudFormation, and CloudWatch Logs

3. **OpenRouter** (free) - [openrouter.ai](https://openrouter.ai)
   - Create an account and generate an API key
   - The app uses free models (`nvidia/nemotron-nano-12b-v2-vl:free` for OCR and `nvidia/nemotron-3-super-120b-a12b:free` for chat), so you won't be charged

### Tools to install

- **Node.js 20+** - [nodejs.org](https://nodejs.org) (LTS version recommended)
- **AWS CLI** - [docs.aws.amazon.com/cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **AWS SAM CLI** - [docs.aws.amazon.com/sam](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)

After installing the AWS CLI, configure it with your credentials:

```bash
aws configure
# Enter your Access Key ID, Secret Access Key, region (us-east-1), and output format (json)
```

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "AI Expense Tracker"
```

### 2. Set up the frontend

```bash
cd frontend
npm install
```

Create the environment file by copying the example:

```bash
cp .env.example .env
```

Open `frontend/.env` in a text editor and fill in your Firebase config values. You can find these in the Firebase Console under Project Settings > General > Your apps > Web app:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# This gets filled in after deploying the backend (step 4)
VITE_API_BASE_URL=
```

### 3. Set up the backend

```bash
cd ../backend
npm install
```

### 4. Deploy the backend to AWS

The backend uses AWS SAM to define and deploy all the cloud resources (Lambda functions, DynamoDB table, S3 bucket, API Gateway).

```bash
cd infra
sam build
sam deploy --guided
```

During `sam deploy --guided`, you'll be prompted for:

| Parameter | What to enter |
|-----------|--------------|
| Stack Name | `expense-mvp-dev` (or any name you like) |
| AWS Region | `us-east-1` (or your preferred region) |
| ReceiptBucketName | A globally unique S3 bucket name, e.g. `my-expense-receipts-123` |
| ExpenseTableName | `ExpensesDev` (or any name) |
| UploadPrefix | `uploads/` (leave the default) |
| OpenRouterApiKey | Your OpenRouter API key |
| FirebaseProjectId | Your Firebase project ID (found in Firebase Console > Project Settings) |

After deployment finishes, SAM will print an **ApiUrl** output. It looks like:

```
https://abc123def.execute-api.us-east-1.amazonaws.com
```

Copy this URL and paste it as `VITE_API_BASE_URL` in your `frontend/.env` file.

### 5. Deploy Firestore rules

From the project root, deploy the security rules so only authenticated users can access their own profile data:

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login and deploy rules
firebase login
firebase deploy --only firestore:rules
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

The app will open at [http://localhost:5173](http://localhost:5173). Create an account or sign in with Google to get started.

## API Endpoints

All endpoints (except the S3-triggered `processReceipt`) require a Firebase ID token in the `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

| Method | Path | Description |
|--------|------|-------------|
| POST | `/expense` | Create a new expense |
| GET | `/expenses` | List all expenses for the authenticated user |
| PUT | `/expense` | Update an existing expense (requires `expenseId` in body) |
| DELETE | `/expense` | Delete an expense (requires `expenseId` in body) |
| POST | `/receipt/upload` | Get a presigned S3 URL for uploading a receipt image |
| POST | `/ai/chat` | Send a message to the AI expense assistant |

## Development

### Running the frontend locally

```bash
cd frontend
npm run dev          # Start dev server at localhost:5173
```

### Redeploying backend changes

After modifying any backend code (Lambda handlers, libs, etc.):

```bash
cd backend/infra
sam build && sam deploy
```

SAM will only update the resources that changed.

## AWS Resources Created

The SAM template creates the following resources (all free-tier eligible):

| Resource | Type | Purpose |
|----------|------|---------|
| ExpensesTable | DynamoDB (on-demand) | Stores all expense records |
| ReceiptBucket | S3 | Stores uploaded receipt images (auto-deleted after 30 days) |
| HttpApi | API Gateway v2 | Routes HTTP requests to Lambda functions |
| 7 Lambda Functions | Lambda | Business logic (CRUD, upload, OCR, chat) |
| 7 Log Groups | CloudWatch Logs | Lambda execution logs (auto-deleted after 7 days) |
