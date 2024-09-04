
# MasFana MongoDB Data API SDK

  

A TypeScript SDK for interacting with MongoDB Atlas Data API with full IntelliSense support for query operators.

  

Alternative for Native MongoDB SDK

## Installation

  

```bash
npm  install  masfana-mongodb-api-sdk
```
### Requirements

-   **Node.js** version 14 or higher.
-   A MongoDB Atlas account with Data API enabled. [Learn how to set up MongoDB Atlas Data API](https://www.mongodb.com/docs/atlas/app-services/data-api/).
-   TypeScript project setup (if you're using TypeScript).

## Getting Started

### Step 1: Setting Up MongoDB Atlas Data API

To use this SDK, you need to enable the **Data API** in your MongoDB Atlas cluster. Here’s a brief guide:

1.  Log in to your [MongoDB Atlas account](https://cloud.mongodb.com/).
2.  Go to **App Services** and click **Create new application**.
3.  Enable the **Data API** for your application.
4.  Copy the **App ID** and **API Key** from the Data API section.

### Step 2: Environment Configuration

To use the SDK, you'll need to configure the MongoDB environment variables in your project. Create a `.env` file in the root of your project:
```bash
touch .env
```
### Step 3: Setting Up Your TypeScript Project

If you're using TypeScript, ensure that you have a basic **tsconfig.json** set up:

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "CommonJS",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```
Create a `src/index.ts` file where you'll write your code.

### Step 4: Using the SDK

1.  Import the SDK and define the types for your MongoDB documents.
2.  Initialize the MongoDB API with environment variables.
3.  Use the provided CRUD methods (`findOne`, `find`, `insertOne`, `updateOne`, `deleteOne`, `aggregate`).

#### Example
```typescript
import { MongoDBAPI } from "mongodb-data-api-sdk";
import * as dotenv from "dotenv";
dotenv.config();

// Define the type of the documents in your MongoDB collection
type Task = {
  text: string;
  status: string;
  completedAt?: Date;
};

// Initialize the MongoDB API SDK with environment variables
const env = {
  MONGO_API_URL: process.env.MONGO_API_URL!,
  MONGO_API_KEY: process.env.MONGO_API_KEY!,
  DATABASE: process.env.DATABASE!,
  COLLECTION: process.env.COLLECTION!,
  DATA_SOURCE: process.env.DATA_SOURCE!
};

const mongoAPI = new MongoDBAPI<Task>(env);

// Example usage of the SDK
async function run() {
  try {
    // Find a single document where the task status is "complete"
    const task = await mongoAPI.findOne({ status: { $eq: "complete" } });
    console.log("Found task:", task);

    // Insert a new task
    const insertResult = await mongoAPI.insertOne({ text: "Clean the kitchen", status: "open" });
    console.log("Inserted task with ID:", insertResult.insertedId);

    // Find all tasks with status "open", sort by `completedAt` field, and return only `text` and `status` fields
    const tasks = await mongoAPI.find(
      { status: { $eq: "open" } },
      { text: 1, status: 1 },
      { completedAt: -1 },
      10 // Limit to 10 results
    );
    console.log("Found tasks:", tasks);

    // Update a task to mark it as "complete"
    const updateResult = await mongoAPI.updateOne({ text: "Clean the kitchen" }, { status: "complete" });
    console.log("Updated task:", updateResult);

    // Delete a task
    const deleteResult = await mongoAPI.deleteOne({ text: "Clean the kitchen" });
    console.log("Deleted task:", deleteResult.deletedCount);

  } catch (error) {
    console.error("Error:", error);
  }
}

run();
```
### Step 5: Running Your Application

To run the example code, ensure you’ve set up your TypeScript project and compiled your code:

```bash
# Install dependencies
npm install

# Compile TypeScript code
npm run build

# Run the compiled JavaScript code
node dist/index.js

### CRUD Operations Overview
```
1.  **Find One Document**
```typescript
const task = await mongoAPI.findOne({ status: { $eq: "complete" } });
```

2. **Find Many Documents**
```typescript
const tasks = await mongoAPI.find(
  { status: { $eq: "open" } },       // Filter
  { text: 1, status: 1 },            // Projection (fields to include)
  { completedAt: -1 },               // Sort by completedAt descending
  10                                 // Limit results to 10
);
```
3. **Insert One Document**
```typescript
const insertResult = await mongoAPI.insertOne({ text: "Buy groceries", status: "open" });
```

4. **Update One Document**
```typescript
const updateResult = await mongoAPI.updateOne({ text: "Buy groceries" }, { status: "complete" });
```
5. **Delete One Document**
```typescript
const deleteResult = await mongoAPI.deleteOne({ text: "Buy groceries" });
```

### MongoDB Query Operators Supported

Here are some common MongoDB query operators supported by this SDK:

-   **`$eq`**: Matches values that are equal to a specified value.
-   **`$ne`**: Matches values that are not equal to a specified value.
-   **`$gt`**: Matches values that are greater than a specified value.
-   **`$gte`**: Matches values that are greater than or equal to a specified value.
-   **`$lt`**: Matches values that are less than a specified value.
-   **`$lte`**: Matches values that are less than or equal to a specified value.
-   **`$in`**: Matches any of the values specified in an array.
-   **`$nin`**: Matches none of the values specified in an array.
-   **`$exists`**: Matches documents where the field exists.

### TypeScript Support

The SDK is fully type-safe, so your code will have **IntelliSense** support for query operators and MongoDB operations. Here's an example of how IntelliSense helps you with MongoDB operators like `$eq`, `$gt`, and more:
```typescript
const filter = {
  status: { $eq: "complete" },
  completedAt: { $gt: new Date("2023-01-01") }
};
```