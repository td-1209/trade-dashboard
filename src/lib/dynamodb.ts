import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput  } from '@aws-sdk/lib-dynamodb';
import { AWS_DEFAULT_REGION } from '@/config/constants';

const DynamoDBConfig = {
  USE_TABLE: 'td-user',
  PROFIT_LOSS_TABLE: 'td-profit-loss',
  CASH_FLOW_TABLE: 'td-cash-flow'
};

export async function getUserInfo() {
  const client = new DynamoDBClient({
    region: AWS_DEFAULT_REGION,
  });
  const docClient = DynamoDBDocumentClient.from(client);
  const params: ScanCommandInput = {
    TableName: DynamoDBConfig.USE_TABLE
  };
  try {
    const command = new ScanCommand(params);
    const response = await docClient.send(command);
    return response.Items;
  } catch (error) {
    console.error('Error scanning table:', error);
    throw error;
  }
};