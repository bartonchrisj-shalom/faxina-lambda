// src/shared/clients.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const dbClient = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(dbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

export const cognitoClient = new CognitoIdentityProviderClient({});

export const TABLE_NAME = process.env.TABLE_NAME || '';
export const USER_POOL_ID = process.env.USER_POOL_ID || '';