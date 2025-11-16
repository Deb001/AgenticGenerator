import os
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/portfolio")

def get_engine():
    attempts = 0
    while attempts < 5:
        try:
            engine = create_engine(DATABASE_URL, pool_pre_ping=True)
            # test connection
            conn = engine.connect()
            conn.close()
            return engine
        except OperationalError:
            attempts += 1
            wait = 2 ** attempts
            print(f"Database connection failed, retrying in {wait}s (attempt {attempts}/5)")
            time.sleep(wait)
    raise RuntimeError("Unable to connect to the database after multiple attempts")

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def create_db_and_tables():
    import app.models  # ensures models are imported before metadata creation
    Base.metadata.create_all(bind=engine)
