"""
Run this script once to create the amenities table in your database.

Usage:
  cd C:\\Users\\Shubham\\Aapli-Wari
  venv\\Scripts\\activate
  python -m backend.app.db.create_amenities_table
"""

from backend.app.db.database import engine
from backend.app.db.base import Base
from backend.app.models.amenity import Amenity  # noqa: F401 — import triggers registration


def create_table():
    print("Creating amenities table...")
    Base.metadata.create_all(bind=engine, tables=[Amenity.__table__])
    print("✅ amenities table created successfully.")


if __name__ == "__main__":
    create_table()
