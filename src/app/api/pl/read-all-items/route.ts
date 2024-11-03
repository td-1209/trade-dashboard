export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { readAllItems } from '@/lib/dynamodb';
import { PlRecord } from '@/types/type';

export async function GET() {
  try {
    const items = await readAllItems<PlRecord>({ tableName: 'td-profit-loss' });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: `記録の読み取りに失敗しました。${error}` }, { status: 500 });
  }
}
