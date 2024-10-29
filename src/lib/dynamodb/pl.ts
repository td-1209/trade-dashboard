import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { AWS_DEFAULT_REGION } from '@/config/constants';

const client = new DynamoDBClient({region: AWS_DEFAULT_REGION,});
const docClient = DynamoDBDocumentClient.from(client);
const dynamodbConfig = {
  TableName: 'td-profit-loss'
};

export interface Item {
  id: string;
  enteredAt: string;
  exitedAt: string;
  baseCurrency: string;
  quoteCurrency: string;
  currencyAmount: number;
  entryType: string;
  entryPrice: number;
  exitPrice: number;
  profitLossPrice: number;
  profitLossPips: number;
  method: string;
  isDemo: boolean;
  memo: string;
}

interface createItemProps {
  item: Item,
}

export async function createItem({ item }: createItemProps) {
  const params = {
    TableName: dynamodbConfig.TableName,
    Item: item,
  };
  try {
    await docClient.send(new PutCommand(params));
    console.log('Item created successfully');
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
}

interface readItemProps {
  key: {
    id: string,
  }
}

export async function readItem({ key }: readItemProps) {
  const params = {
    TableName: dynamodbConfig.TableName,
    Key: key,
  };
  try {
    const { Item } = await docClient.send(new GetCommand(params));
    if (Item === undefined) {
      throw new Error('Item is undefined.');
    } else {
      return Item as Item;
    }
  } catch (error) {
    console.error('Error getting item:', error);
    throw error;
  }
}

export async function readAllItems() {
  const params = {
    TableName: dynamodbConfig.TableName,
  };
  try {
    const { Items } = await docClient.send(new ScanCommand(params));
    if (Items === undefined) {
      throw new Error('Items is undefined.');
    } else {
      return Items as Item[];
    }
  } catch (error) {
    console.error('Error scanning table:', error);
    throw error;
  }
}

interface readItemsWithConditionProps {
  secondaryIndex: string;
  partitionKey: {
    field: string,
    operator: '=' | '>' | '<';
    value: any
    matchType: 'AND' | 'OR';
  },
  sortKey: {
    field: string,
    operator: '=' | '>' | '<';
    value: any;
  }, 
}

export async function readItemsWithCondition({ secondaryIndex, partitionKey, sortKey }: readItemsWithConditionProps) {
  // fix: mapやreduceの運用見直し
  const queryExpression = `${partitionKey.field} ${partitionKey.operator} :partitionKey ${partitionKey.matchType} ${sortKey.field} ${sortKey.operator} :sortKey`;
  const expressionAttributeValues = {
    ':partitionKey': partitionKey.value,
    ':sortKey': sortKey.value
  };
  const params = {
    TableName: dynamodbConfig.TableName,
    IndexName: secondaryIndex,
    KeyConditionExpression: queryExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  console.log(params);
  try {
    const { Items } = await docClient.send(new QueryCommand(params));
    if (Items === undefined) {
      throw new Error('Items is undefined.');
    } else {
      return Items as Item[];
    }
  } catch (error) {
    console.error('Error querying items:', error);
    throw error;
  }
}

interface updateItemProps {
  key: {
    id: string,
  },
  updateFields: Record<string, any>
}

export async function updateItem({ key, updateFields}: updateItemProps) {
  // fix: mapやreduceの運用見直し
  const updateExpression = 'SET ' + Object.keys(updateFields).map(key => `${key} = :${key}`).join(', ');
  const expressionAttributeValues = Object.entries(updateFields).reduce(
    (acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {}
  );
  const params = {
    TableName: dynamodbConfig.TableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  console.log(params);
  try {
    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

interface deleteItemProps {
  key: {
    id: string,
  }
}

export async function deleteItem({ key }: deleteItemProps) {
  const params = {
    TableName: dynamodbConfig.TableName,
    Key: key,
  };
  try {
    await docClient.send(new DeleteCommand(params));
    console.log('Item deleted successfully');
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}