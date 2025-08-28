import { createClient } from '@supabase/supabase-js';
import { format, parse } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';

// 環境変数を直接読み込み
const loadEnvFile = () => {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }
  } catch (error) {
    console.error('環境変数ファイル読み込みエラー:', error);
  }
};

loadEnvFile();

interface PlRow {
  base_currency: string;
  quote_currency: string;
  entered_at: string;
  exited_at: string;
  position: 'long' | 'short';
  entry: number;
  exit: number;
  profit_loss: number;
  reason_detail: string;
  result_detail: string;
  take_profit: number;
  loss_cut: number;
  domain: 'fx' | 'stock' | 'gold';
  method: string;
  reason_image: string;
  result_image: string;
}

interface CfRow {
  executed_at: string;
  price: number;
  quote_currency: string;
}

function parsePlCSVRow(row: string): PlRow {
  const fields = row.split(',');
  return {
    base_currency: fields[0],
    quote_currency: fields[1],
    entered_at: parseDateTime(fields[2]),
    exited_at: parseDateTime(fields[3]),
    position: fields[4] as 'long' | 'short',
    entry: parseFloat(fields[5]),
    exit: parseFloat(fields[6]),
    profit_loss: parseFloat(fields[7]),
    reason_detail: fields[8],
    result_detail: fields[9],
    take_profit: parseFloat(fields[10]),
    loss_cut: parseFloat(fields[11]),
    domain: fields[12] as 'fx' | 'stock' | 'gold',
    method: fields[13],
    reason_image: fields[14],
    result_image: fields[15],
  };
}

function parseCfCSVRow(row: string): CfRow {
  const fields = row.split(',').map(field => field.trim());
  return {
    executed_at: parseDateTime(fields[0]),
    price: parseFloat(fields[1]),
    quote_currency: fields[2],
  };
}

function parseDateTime(dateStr: string): string {
  const parsedDate = parse(dateStr, 'yyyy-MM-dd_HH-mm', new Date());
  return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss") + '+09:00';
}

async function initPlData() {
  try {
    console.log('PLテーブル初期化開始...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 既存データを削除
    const { error: deleteError } = await supabase
      .from('pl')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('既存データ削除エラー:', deleteError);
      return;
    }

    // CSVファイルを読み込み
    const csvPath = path.join(__dirname, './pl.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter((line) => line.trim());

    // ヘッダー行をスキップ
    const dataLines = lines.slice(1);

    console.log(`${dataLines.length}件のPLデータを処理中...`);

    // データを挿入
    for (const line of dataLines) {
      if (!line.trim()) continue;

      const transaction = parsePlCSVRow(line);

      const { error } = await supabase.from('pl').insert({
        base_currency: transaction.base_currency,
        quote_currency: transaction.quote_currency,
        entered_at: transaction.entered_at,
        exited_at: transaction.exited_at,
        position: transaction.position,
        entry: transaction.entry,
        exit: transaction.exit,
        profit_loss: transaction.profit_loss,
        reason_detail: transaction.reason_detail,
        result_detail: transaction.result_detail,
        take_profit: transaction.take_profit,
        loss_cut: transaction.loss_cut,
        domain: transaction.domain,
        method: transaction.method,
        reason_image: transaction.reason_image,
        result_image: transaction.result_image,
      });

      if (error) {
        console.error('データ挿入エラー:', error);
        continue;
      }
    }

    console.log('PLテーブル初期化完了!');

    // 挿入されたデータ数を確認
    const { count, error: countError } = await supabase
      .from('pl')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('データ数確認エラー:', countError);
    } else {
      console.log(`PL合計 ${count} 件のデータが挿入されました`);
    }
  } catch (error) {
    console.error('PL初期化処理エラー:', error);
  }
}

async function initCfData() {
  try {
    console.log('CFテーブル初期化開始...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 既存データを削除
    const { error: deleteError } = await supabase
      .from('cf')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('既存データ削除エラー:', deleteError);
      return;
    }

    // CSVファイルを読み込み
    const csvPath = path.join(__dirname, './cf.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter((line) => line.trim());

    // ヘッダー行をスキップ
    const dataLines = lines.slice(1);

    console.log(`${dataLines.length}件のCFデータを処理中...`);

    // データを挿入
    for (const line of dataLines) {
      if (!line.trim()) continue;

      const cfData = parseCfCSVRow(line);

      const { error } = await supabase.from('cf').insert({
        executed_at: cfData.executed_at,
        price: cfData.price,
        quote_currency: cfData.quote_currency,
      });

      if (error) {
        console.error('データ挿入エラー:', error);
        continue;
      }
    }

    console.log('CFテーブル初期化完了!');

    // 挿入されたデータ数を確認
    const { count, error: countError } = await supabase
      .from('cf')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('データ数確認エラー:', countError);
    } else {
      console.log(`CF合計 ${count} 件のデータが挿入されました`);
    }
  } catch (error) {
    console.error('CF初期化処理エラー:', error);
  }
}

async function migrate() {
  await initPlData();
  await initCfData();
}

migrate();
