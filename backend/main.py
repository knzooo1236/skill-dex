from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import engine, get_db, Base
import models

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


# --- エンドポイント ---

@app.get("/")
def read_root():
    return {"message": "スキル図鑑へようこそ！"}


# 全件取得
@app.get("/skills", response_model=list[SkillResponse])
def get_all_skills(db: Session = Depends(get_db)):
    return db.query(models.Skill).all()


# 1件取得
@app.get("/skills/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="スキルが見つかりません")
    return skill


# 新規登録
@app.post("/skills", response_model=SkillResponse)
def create_skill(skill: SkillCreate, db: Session = Depends(get_db)):
    new_skill = models.Skill(**skill.model_dump())
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


# 更新
@app.put("/skills/{skill_id}", response_model=SkillResponse)
def update_skill(skill_id: int, skill: SkillCreate, db: Session = Depends(get_db)):
    target = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
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
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    target = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="スキルが見つかりません")
    db.delete(target)
    db.commit()
    return {"message": f"ID:{skill_id} を削除しました"}