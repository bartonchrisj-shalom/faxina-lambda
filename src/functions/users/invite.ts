// src/functions/users/invite.ts
import { AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, docClient, TABLE_NAME, USER_POOL_ID } from '../../shared/clients';
import { InviteUserInput } from './schema';
import { logger } from '../../shared/logger';

export const inviteUser = async (adminId: string, data: InviteUserInput) => {
  logger.info(`Admin ${adminId} is inviting ${data.email} via native Cognito`);

  try {
    // 1. Tell Cognito to create the user and email them the temporary password
    const cognitoCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: data.email,
      UserAttributes: [
        { Name: 'email', Value: data.email },
        { Name: 'email_verified', Value: 'true' } // Auto-verify since an admin created it
      ],
      DesiredDeliveryMediums: ['EMAIL'], // AWS handles sending the email
    });

    const cognitoResponse = await cognitoClient.send(cognitoCommand);
    
    // Extract the unique 'sub' ID that Cognito generated for this new user
    const cognitoUserId = cognitoResponse.User?.Attributes?.find(attr => attr.Name === 'sub')?.Value;

    if (!cognitoUserId) {
      throw new Error('Failed to retrieve Cognito User ID');
    }

    // 2. Create the initial profile in DynamoDB with a PENDING status
    const dbCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${cognitoUserId}`,
        SK: `PROFILE`,
        email: data.email,
        status: 'PENDING',
        invitedBy: adminId,
        createdAt: new Date().toISOString(),
      },
    });
    
    await docClient.send(dbCommand);

    return { message: `Invitation sent to ${data.email}` };

  } catch (error: any) {
    // Handle the case where the user already exists in the pool
    if (error.name === 'UsernameExistsException') {
      logger.warn(`Attempted to invite existing user: ${data.email}`);
      throw new Error('User already exists');
    }
    throw error;
  }
};