import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://signage_user:signage_pass@signage_db:5432/signage")

engine       = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
