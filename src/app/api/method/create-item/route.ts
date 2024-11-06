export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createItem } from '@/lib/dynamodb';
import { Method } from '@/types/type';

export async function POST(req: Request) {
  try {
    const { item } = await req.json();
    await createItem<Method>({ item: item, tableName: 'td-method' });
    return NextResponse.json({ message: '記録が作成されました。' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `記録の作成に失敗しました。${error}` }, { status: 500 });
  }
}
