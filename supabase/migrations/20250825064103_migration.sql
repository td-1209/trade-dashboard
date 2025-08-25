-- PLテーブル（損益記録テーブル）の作成
CREATE TABLE IF NOT EXISTS pl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency TEXT, -- 金や株を考慮するためNULL許容
    quote_currency TEXT, -- 金や株を考慮するためNULL許容
    entered_at TIMESTAMPTZ NOT NULL,
    exited_at TIMESTAMPTZ,
    position TEXT NOT NULL CHECK (position IN ('long', 'short')),
    entry DECIMAL(20,8) NOT NULL,
    exit DECIMAL(20,8),
    profit_loss DECIMAL(20,8),
    reason_detail TEXT NOT NULL,
    result_detail TEXT,
    take_profit DECIMAL(20,8) NOT NULL,
    loss_cut DECIMAL(20,8) NOT NULL,
    domain TEXT NOT NULL CHECK (domain IN ('fx', 'stock', 'gold')),
    method TEXT NOT NULL,
    reason_image TEXT NOT NULL, -- 画像パス
    result_image TEXT, -- 画像パス
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CFテーブル（キャッシュフロー記録テーブル）の作成  
CREATE TABLE IF NOT EXISTS cf (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_currency TEXT NOT NULL CHECK (quote_currency = 'JPY'),
    executed_at TIMESTAMPTZ NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at を自動更新するためのトリガー関数を作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- PLテーブルのupdated_atトリガー
CREATE TRIGGER update_pl_updated_at
    BEFORE UPDATE ON pl
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- CFテーブルのupdated_atトリガー
CREATE TRIGGER update_cf_updated_at
    BEFORE UPDATE ON cf
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();