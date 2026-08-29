from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.core.config import DATABASE_URL


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"sslmode": "require"},
    pool_size=5,        # Keep base connections low
    max_overflow=5,     # Hard cap at 10 total connections (safely under the 15 limit)
    pool_timeout=30     # Wait up to 30 seconds for a connection instead of crashing
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def get_db():
    db: Session = SessionLocal()

    try:
        yield db
    finally:
        db.close()