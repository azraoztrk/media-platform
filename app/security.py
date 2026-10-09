import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")            #JWT_SECRET_KEY: .env dosyasında sakladığın gizli anahtarı alır. Token’ın imzalanmasında kullanılır.
JWT_ALGORITHM = "HS256"                                 #JWT_ALGORITHM = "HS256": Token’ı imzalamak için kullanılacak algoritmayı belirler.
ACCESS_TOKEN_EXPIRE_MINUTES = 30                        #ACCESS_TOKEN_EXPIRE_MINUTES = 30: Üretilen token 30 dakika sonra geçerliliğini yitirir.

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password
    )


def create_access_token(subject: str) -> str:
    if not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY is not configured")

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": subject,                            #sub: Token’ın hangi kullanıcıya ait olduğunu belirtir. Biz burada kullanıcının e-posta adresini kullanacağız.
        "exp": expire                              #exp: Token’ın son kullanma zamanını belirtir.
    }

    return jwt.encode(                             #jwt.encode(): Bu bilgileri ve gizli anahtarı kullanarak token üretir.
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

def decode_access_token(token: str) -> dict:
    if not JWT_SECRET_KEY:
        raise RuntimeError('JWT_SECRET_KEY is not configured')
    
    return jwt.decode(
        token,
        JWT_SECRET_KEY,
        algorithms=[JWT_ALGORITHM]
    )