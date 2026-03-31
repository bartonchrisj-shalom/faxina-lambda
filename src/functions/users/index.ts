import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import { logger } from '../../shared/logger';
import { getUserProfile } from './get';
import { updateUserProfile } from './put';
import { updateUserSchema } from './schema';

const baseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // 1. Extract the Cognito User ID from the API Gateway authorizer context
  const userId = event.requestContext.authorizer?.claims?.sub;
  
  if (!userId) {
    logger.error('Unauthorized request - missing Cognito sub claim');
    return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
  }

  const method = event.httpMethod;

  try {
    // 2. Route the request
    if (method === 'GET') {
      const profile = await getUserProfile(userId);
      return {
        statusCode: 200,
        body: JSON.stringify(profile),
      };
    }

    if (method === 'PUT') {
      // event.body is automatically parsed to a JSON object by Middy
      const parsedBody = updateUserSchema.parse(event.body); 
      const result = await updateUserProfile(userId, parsedBody);
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    }

    // Fallback for unsupported methods
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };

  } catch (error: any) {
    logger.error('Error processing request', { error });

    // Handle Zod validation errors cleanly
    if (error.name === 'ZodError') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid input', errors: error.errors }),
      };
    }

    throw error; // Let Middy's httpErrorHandler catch unhandled server errors
  }
};

// 3. Wrap the handler with Middy middleware
export const handler = middy(baseHandler)
  .use(jsonBodyParser())
  .use(httpErrorHandler());
