import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../../shared/clients';
import { logger } from '../../shared/logger';

export const getUserProfile = async (userId: string) => {
  logger.info(`Fetching profile for user: ${userId}`);

  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: `PROFILE`,
    },
  });

  const response = await docClient.send(command);
  
  if (!response.Item) {
    // Return a default empty profile if they haven't set up their name yet
    return { name: null }; 
  }

  return response.Item;
};
