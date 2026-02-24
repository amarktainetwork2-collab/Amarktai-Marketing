from app.db.base import SessionLocal, engine, Base
from typing import Generator

# Export for use in other modules
__all__ = ["SessionLocal", "engine", "Base", "get_db"]


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
