import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../../shared/clients';
import { UpdateUserInput } from './schema';
import { logger } from '../../shared/logger';

export const updateUserProfile = async (userId: string, data: UpdateUserInput) => {
  logger.info(`Updating profile for user: ${userId}`);

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${userId}`,
      SK: `PROFILE`,
      name: data.name,
      updatedAt: new Date().toISOString(),
    },
  });

  await docClient.send(command);

  return { message: 'Profile updated successfully' };
};
