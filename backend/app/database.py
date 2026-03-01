from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.settings import settings
from app.models.base import Base

# Render uses postgres://; SQLAlchemy requires postgresql://
db_url = settings.database_url
if db_url.startswith("postgres://"):
    db_url = "postgresql://" + db_url[len("postgres://") :]

engine = create_engine(
    db_url,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
