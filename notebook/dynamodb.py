from typing import Any, Dict, List

import boto3
from mypy_boto3_dynamodb import DynamoDBServiceResource
from mypy_boto3_dynamodb.service_resource import Table

from notebook.config import Config


class RecordFetcher:
    """DynamoDBからレコードを取得するためのクラス。"""

    @staticmethod
    def get_all_records(table_name: str) -> List[Dict[str, Any]]:
        """指定されたDynamoDBテーブルから全てのレコードを取得します。

        Args:
            table_name (str): 取得対象のDynamoDBテーブル名

        Returns:
            List[Dict[str, Any]]: 取得したレコードのリスト。各レコードはDynamoDBの項目を表す辞書で、
            以下のような構造を持ちます：
            {
                'id': str,          # レコードの一意識別子
                'created_at': str,  # 作成日時（ISO 8601形式）
                'updated_at': str,  # 更新日時（ISO 8601形式）
                ...                 # その他のフィールド
            }

        Raises:
            Exception: 環境変数が設定されていない場合や、DynamoDB操作でエラーが発生した場合
        """
        # 設定を読み込む
        config = Config()
        if not all([config.aws_access_key_id, config.aws_secret_access_key, config.aws_region]):
            raise Exception("AWS credentials are not properly configured in .env.local")

        # DynamoDBクライアントを初期化
        dynamodb: DynamoDBServiceResource = boto3.resource(
            'dynamodb',
            aws_access_key_id=config.aws_access_key_id,
            aws_secret_access_key=config.aws_secret_access_key,
            region_name=config.aws_region
        )

        # テーブルを取得
        table: Table = dynamodb.Table(table_name)

        # 全レコードを取得
        response = table.scan()
        items: List[Dict[str, Any]] = response.get('Items', [])

        # ページネーションがある場合は全て取得
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))

        return items
