from backend.app.db.base import Base
from backend.app.db.database import engine

# Import models so SQLAlchemy registers their metadata.
from backend.app.db import models  # noqa: F401


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created successfully.")