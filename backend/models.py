from sqlalchemy import Column, Integer, String
from database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    level = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)