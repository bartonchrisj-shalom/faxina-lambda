import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

// 1. DynamoDB Setup
const dbClient = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(dbClient, {
  marshallOptions: {
    removeUndefinedValues: true, // Automatically strips undefined fields before saving
  },
});

export const TABLE_NAME = process.env.TABLE_NAME || '';

// 2. Bedrock Setup (Ready for your AI features later)
export const bedrockClient = new BedrockRuntimeClient({});