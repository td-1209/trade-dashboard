import { NextResponse } from 'next/server';
import { createItem } from '@/lib/dynamodb';
import { PlRecord } from '@/types/type';

export async function POST(req: Request) {
  try {
    const { item } = await req.json();
    await createItem<PlRecord>({ item: item, tableName: 'td-profit-loss' });
    return NextResponse.json({ message: '記録が作成されました。' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `記録の作成に失敗しました。${error}` }, { status: 500 });
  }
}
