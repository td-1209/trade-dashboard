import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { AWS_DEFAULT_REGION } from '@/config/constants';
import { Item } from '@/types/type';

const client = new DynamoDBClient({region: AWS_DEFAULT_REGION,});
const docClient = DynamoDBDocumentClient.from(client);

export async function createItem<T extends Record<string, Item>>({ item, tableName }: { item: T, tableName: string }) {
  const params = {
    TableName: tableName,
    Item: item,
  };
  await docClient.send(new PutCommand(params));
}

export async function readItem<T extends Record<string, Item>>({ partitionKey, tableName }: { partitionKey: Record<string, string>, tableName: string }) {
  const params = {
    TableName: tableName,
    Key: partitionKey,
  };
  const { Item } = await docClient.send(new GetCommand(params));
  if (Item === undefined) {
    throw new Error('Item is undefined.');
  } else {
    return Item as T;
  }
}

export async function readAllItems<T extends Record<string, Item>>({ tableName }: { tableName: string }) {
  const params = {
    TableName: tableName,
  };
  const { Items } = await docClient.send(new ScanCommand(params));
  if (Items === undefined) {
    throw new Error('Items is undefined.');
  } else {
    return Items as T[];
  }
}

export async function readAllItemsWithSort<T extends Record<string, Item>>({
  tableName,
  indexName,
  partitionKeyName,
  sortKeyName,
  sortOrder = 'DESC'
}: {
  tableName: string;
  indexName: string;
  partitionKeyName: string;
  sortKeyName: string;
  sortOrder: 'ASC' | 'DESC';
}) {
  const params = {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: '#sk = :skValue AND #pk = :pkValue',
    ExpressionAttributeNames: {
      '#pk': partitionKeyName,
      '#sk': sortKeyName
    },
    ExpressionAttributeValues: {
      // note: すべてのアイテムを取得するための定数値
      ':pkValue': 'NULL',
      ':skValue': 'NULL'
    },
    ScanIndexForward: sortOrder === 'ASC'
  };
  const { Items } = await docClient.send(new QueryCommand(params));
  if (Items === undefined) {
    throw new Error('Items is undefined.');
  } else {
    return Items as T[];
  }
}

interface readItemsWithConditionProps {
  secondaryIndex: string;
  partitionKey: {
    field: string,
    operator: '=' | '>' | '<';
    value: Item;
    matchType: 'AND' | 'OR';
  };
  sortKey: {
    field: string,
    operator: '=' | '>' | '<';
    value: Item;
  };
  tableName: string;
}

export async function readItemsWithCondition<T extends Record<string, Item>>({ secondaryIndex, partitionKey, sortKey, tableName }: readItemsWithConditionProps) {
  const queryExpression = `${partitionKey.field} ${partitionKey.operator} :partitionKey ${partitionKey.matchType} ${sortKey.field} ${sortKey.operator} :sortKey`;
  const expressionAttributeValues = {
    ':partitionKey': partitionKey.value,
    ':sortKey': sortKey.value
  };
  const params = {
    TableName: tableName,
    IndexName: secondaryIndex,
    KeyConditionExpression: queryExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };
  const { Items } = await docClient.send(new QueryCommand(params));
  if (Items === undefined) {
    throw new Error('Items is undefined.');
  } else {
    return Items as T[];
  }
}

interface updateItemProps {
  partitionKey: Record<string, string>;
  updateFields: Record<string, string>;
  tableName: string;
}

export async function updateItem<T extends Record<string, Item>>({ partitionKey, updateFields, tableName}: updateItemProps) {
  const updateExpression = 'SET ' + Object.keys(updateFields).map(key => `#${key} = :${key}`).join(', ');
  const expressionAttributeValues = Object.entries(updateFields).reduce(
    (acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {}
  );
  const expressionAttributeNames = Object.keys(updateFields).reduce(
    (acc, key) => ({ ...acc, [`#${key}`]: key }), {}
  );
  const params = {
    TableName: tableName,
    Key: partitionKey,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
  };
  await docClient.send(new UpdateCommand(params));
}

interface deleteItemProps {
  partitionKey: Record<string, string>;
  tableName: string;
}

export async function deleteItem<T extends Record<string, Item>>({ partitionKey, tableName }: deleteItemProps) {
  const params = {
    TableName: tableName,
    Key: partitionKey,
  };
  await docClient.send(new DeleteCommand(params));
}

interface isExistPartitionKeyProps {
  partitionKeyName: string;
  partitionKeyValue: string;
  tableName: string;
}

export async function isExistPartitionKey<T extends Record<string, Item>>({ partitionKeyName, partitionKeyValue, tableName }: isExistPartitionKeyProps): Promise<boolean> {
  const params = {
    TableName: tableName,
    KeyConditionExpression: `${partitionKeyName} = :value`,
    ExpressionAttributeValues: {
      ':value': partitionKeyValue
    },
    Limit: 1
  };
  const { Items } = await docClient.send(new QueryCommand(params));
  return Items !== undefined && Items.length > 0;
}

export function sortItems<T extends Record<string, Item>>({ items, keyName, type }: { items: T[], keyName: string, type: 'ASC' | 'DSC' }): T[] {
  switch (type) {
  case 'ASC':
    return [...items].sort((a, b) => {
      if (a[keyName] < b[keyName]) return -1;
      if (a[keyName] > b[keyName]) return 1;
      return 0;
    });
  case 'DSC':
    return [...items].sort((a, b) => {
      if (a[keyName] > b[keyName]) return -1;
      if (a[keyName] < b[keyName]) return 1;
      return 0;
    });
  default:
    throw new Error('ソートタイプの値が不正です。');
  }
};