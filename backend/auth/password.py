"""Password hashing and verification using bcrypt (via passlib).

Uses ``bcrypt_sha256`` instead of raw ``bcrypt`` to avoid the 72‑byte password
length limitation in the underlying bcrypt algorithm.
"""

from passlib.context import CryptContext

# ``bcrypt_sha256`` safely pre-hashes the password with SHA-256 before bcrypt,
# which avoids the 72‑byte limit while remaining compatible with passlib.
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt_sha256."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt_sha256."""
    return pwd_context.verify(plain_password, hashed_password)
