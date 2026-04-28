from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import engine, get_db, Base
import models
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

# テーブル自動作成（起動時に実行）
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS設定（フロントからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ユーザー認証用のスキーマ ---
class UserCreate(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# --- リクエスト/レスポンス用の型（Pydantic） ---
class SkillCreate(BaseModel):
    name: str
    level: int
    category: str


class SkillResponse(BaseModel):
    id: int
    name: str
    level: int
    category: str

    class Config:
        from_attributes = True

# ==========================================
# 認証エンドポイント
# ==========================================

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 重複チェック
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")

    # パスワードをハッシュ化して保存
    new_user = models.User(
        username=user.username,
        password_hash=hash_password(user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # ユーザー検索
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="ユーザー名またはパスワードが間違っています")

    # パスワード検証
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="ユーザー名またはパスワードが間違っています")

    # JWT発行
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """ログイン中のユーザー情報を返す"""
    return current_user

# --- エンドポイント ---

@app.get("/")
def read_root():
    return {"message": "スキル図鑑へようこそ！"}


# 全件取得
@app.get("/skills", response_model=list[SkillResponse])
def get_all_skills(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # 🆕
):
    # 自分のスキルだけ返す
    return db.query(models.Skill).filter(
        models.Skill.owner_id == current_user.id
    ).all()


# 1件取得
@app.get("/skills/{skill_id}", response_model=SkillResponse)
def get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # 🆕
):
    skill = db.query(models.Skill).filter(
        models.Skill.id == skill_id,
        models.Skill.owner_id == current_user.id,  # 🆕 自分のスキルだけ
    ).first()
    if not skill:
        raise HTTPException(status_code=404, detail="スキルが見つかりません")
    return skill


# 新規登録
@app.post("/skills", response_model=SkillResponse)
def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # 🆕
):
    new_skill = models.Skill(
        **skill.model_dump(),
        owner_id=current_user.id,  # 🆕 ログインユーザーのIDをセット
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


# 更新
@app.put("/skills/{skill_id}", response_model=SkillResponse)
def update_skill(
    skill_id: int,
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # 🆕
):
    target = db.query(models.Skill).filter(
        models.Skill.id == skill_id,
        models.Skill.owner_id == current_user.id,  # 🆕
    ).first()
    if not target:
        raise HTTPException(status_code=404, detail="スキルが見つかりません")
    target.name = skill.name
    target.level = skill.level
    target.category = skill.category
    db.commit()
    db.refresh(target)
    return target


# 削除
@app.delete("/skills/{skill_id}")
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  # 🆕
):
    target = db.query(models.Skill).filter(
        models.Skill.id == skill_id,
        models.Skill.owner_id == current_user.id,  # 🆕
    ).first()
    if not target:
        raise HTTPException(status_code=404, detail="スキルが見つかりません")
    db.delete(target)
    db.commit()
    return {"message": f"ID:{skill_id} を削除しました"}