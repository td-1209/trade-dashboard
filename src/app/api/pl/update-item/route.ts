import { NextResponse } from 'next/server';
import { updateItem } from '@/lib/dynamodb';

export async function POST(req: Request) {
  try {
    const { id, item } = await req.json();
    await updateItem({ partitionKey: { id: id }, updateFields: item, tableName: 'td-profit-loss' });
    return NextResponse.json({ message: '記録が更新されました。' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `記録の更新に失敗しました。${error}` }, { status: 500 });
  }
}
