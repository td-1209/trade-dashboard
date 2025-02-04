import os
from typing import Optional

from dotenv import load_dotenv


class Config:
    """環境設定を管理するシングルトンクラス。

    環境変数から設定を読み込み、アプリケーション全体で共有される設定を提供します。
    """

    _instance: Optional['Config'] = None
    _initialized: bool = False

    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: Optional[str] = None

    def __new__(cls) -> 'Config':
        """シングルトンインスタンスを生成または返却します。"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        """コンフィグを初期化し、環境変数を読み込みます。"""
        if not Config._initialized:
            Config._load_env()
            Config._initialized = True

    @classmethod
    def _load_env(cls) -> None:
        """環境変数を.env.localファイルから読み込みます。"""
        env_path = "/Users/teon/Projects/241028_TRADE/trade-dashboard/.env.local"
        load_dotenv(env_path)

        cls.aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        cls.aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        cls.aws_region = os.getenv('AWS_DEFAULT_REGION', 'ap-northeast-1')
