from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# MySQL接続URL（パスワードは自分のに合わせて）
DATABASE_URL = "mysql+pymysql://root:root1234@localhost:3306/skill_dex?charset=utf8mb4"

# エンジン作成（DB接続の司令塔）
engine = create_engine(DATABASE_URL)

# セッション作成（DB操作の窓口）
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# テーブル定義のベースクラス
Base = declarative_base()


# エンドポイントで使うDBセッション取得関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()