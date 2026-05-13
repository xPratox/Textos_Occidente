# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings
import os

DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL, echo=True) # `echo=True` para ver las queries SQL

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def create_db_tables():

    Base.metadata.create_all(bind=engine)
    print("Tablas verificadas/creadas exitosamente.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()