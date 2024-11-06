export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { readItem } from '@/lib/dynamodb';
import { CfRecord } from '@/types/type';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'IDが指定されていません。' }, { status: 400 });
  }
  try {
    const item = await readItem<CfRecord>({ partitionKey: { id: id }, tableName: 'td-cash-flow' });
    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `記録の読み取りに失敗しました。${error}` }, { status: 500 });
  }
}
