import { PostAuthenticationTriggerEvent, Context } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../../../shared/clients';
import { logger } from '../../../shared/logger';

export const handler = async (event: PostAuthenticationTriggerEvent, context: Context) => {
  // Extract the unique Cognito sub ID
  const userId = event.request.userAttributes.sub;

  logger.info(`Post-Authentication triggered for user ${userId}`);

  try {
    // We use an UpdateCommand so we don't accidentally overwrite their email or name
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `PROFILE`
      },
      // Update the status and track when they last logged in
      UpdateExpression: "SET #status = :confirmed, lastLoginAt = :now",
      // Security: Only update if the user profile actually exists in the DB
      ConditionExpression: "attribute_exists(PK)",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":confirmed": "CONFIRMED",
        ":now": new Date().toISOString()
      }
    });

    await docClient.send(command);
    logger.info(`User ${userId} successfully updated to CONFIRMED`);
    
  } catch (error) {
    logger.error('Failed to update user status in DynamoDB', { error });
    // CRITICAL: We catch but do NOT throw the error. 
    // Throwing an error here would abort the user's login process!
  }

  // You MUST return the original event back to Cognito so it knows to proceed with the login
  return event;
};