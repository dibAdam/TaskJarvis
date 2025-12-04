"""Base models and mixins for SQLAlchemy"""

from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()


from sqlalchemy.sql import func

class TimestampMixin:
    """Mixin to add created_at and updated_at timestamps.

    Using both a SQLAlchemy ``default`` and a DB-side ``server_default`` ensures
    that new rows always get non-null timestamps, even if the existing DB
    schema was created without a server default.
    """

    # Python-side default so SQLAlchemy always sends a value on INSERT
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
