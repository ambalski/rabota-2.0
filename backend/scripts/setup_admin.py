"""
One-time script to create the first admin user after deployment.
Run from project root: python -m backend.scripts.setup_admin
Or from backend/: python scripts/setup_admin.py
"""
import sys
import os

# Add backend to path when run from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Try to use app config and models
try:
    from app.config.settings import settings
    from app.models.user import User
    from app.models.base import Base
    from app.auth import hash_password
    _has_models = True
except ImportError:
    _has_models = False
    settings = None
    hash_password = None


def get_engine():
    database_url = os.environ.get("DATABASE_URL")
    if not database_url and _has_models and settings:
        database_url = settings.database_url
    if not database_url:
        raise SystemExit(
            "DATABASE_URL environment variable is not set. "
            "Set it or run from backend with app config (default: sqlite:///./rabota.db)."
        )
    if database_url.startswith("postgres://"):
        database_url = "postgresql://" + database_url[len("postgres://") :]
    return create_engine(database_url)


def create_admin(email: str, password: str):
    engine = get_engine()
    if not _has_models:
        print("Install app first (pip install -e . or run from backend with app on path).")
        print("Then ensure app.models.user.User and app.config.settings exist.")
        sys.exit(1)

    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    existing = session.query(User).filter(User.email == email).first()
    if existing:
        print(f"User {email} already exists.")
        session.close()
        return

    hashed = hash_password(password)
    admin = User(
        email=email,
        hashed_password=hashed,
        is_active=True,
        is_superuser=True,
    )
    session.add(admin)
    session.commit()
    session.close()
    print(f"Admin user created: {email}")


if __name__ == "__main__":
    import getpass
    email = input("Admin email: ").strip() or "admin@example.com"
    password = getpass.getpass("Admin password: ")
    if not password:
        print("Password cannot be empty.")
        sys.exit(1)
    create_admin(email, password)
