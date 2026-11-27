import jwt
import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from app.security import (
    hash_password,                                              #hash_password, kayıt sırasında parolayı hash’ler. verify_password: Giriş sırasında parolayı doğrular. create_access_token: Bilgileri doğru olan kullanıcıya JWT üretir.
    verify_password,
    create_access_token,
    decode_access_token
)   
from typing import Literal
from sqlalchemy.orm import Session
from app.database import get_db
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.rss_service import import_rss_articles
from app.email_service import (
    send_verification_email,
    send_password_reset_email,
)
from fastapi.responses import HTMLResponse
from app.models import Article as ArticleModel, User as UserModel      #UserModel, veritabanındaki kullanıcı tablosuna erişmemizi sağlar.
from fastapi import FastAPI, Depends, HTTPException, Query                    #HTTPException, örneğin aynı e-posta adresiyle tekrar kayıt yapılmasını uygun bir HTTP hata koduyla bildirmemizi sağlar.
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field                                  #Field, parola için minimum uzunluk belirlememizi sağlar.

app = FastAPI(
    title="Media Platform API",
    description="Media content management and tracking platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

bearer_scheme = HTTPBearer()

optional_bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    email = payload.get("sub")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(UserModel).filter(
        UserModel.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer_scheme),
    db: Session = Depends(get_db)
):
    if credentials is None:
        return None

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    email = payload.get("sub")

    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(UserModel).filter(
        UserModel.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

def require_roles(*allowed_roles):
    def role_checker(
        current_user: UserModel = Depends(get_current_user)
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

#API’ye gönderilecek haberin hangi bilgileri içermesi gerektiğini tanımlıyoruz.
class Article(BaseModel):
    title: str
    content: str
    image_url: str | None = None

@app.post("/api/articles")                        #Depends: Veritabanı oturumunu endpoint’e sağlar.
def create_article(article: Article, db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles('EDITOR', 'ADMIN'))
    ):
    db_article = ArticleModel(         #-->Yeni bir haber nesnesi oluşturur.
        title=article.title,
        content=article.content,
        image_url=article.image_url
    )

    db.add(db_article)          #Haberi kaydedilmek üzere oturuma ekler.
    db.commit()                 #Veritabanı işlemini kalıcı olarak kaydeder.
    db.refresh(db_article)      #Veritabanından oluşturulan güncel değerleri alır.

    return {
        "message": "Article created successfully",
        "article": {
            "id": db_article.id,
            "title": db_article.title,
            "content": db_article.content,
            "created_at": db_article.created_at
        }
    }

@app.get("/api/articles")
def get_articles(
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: UserModel | None = Depends(get_optional_user)):
    query = db.query(ArticleModel)

    if current_user is None or current_user.role == "USER":
        query = query.filter(
            ArticleModel.is_active == True
        )

    if category:
        query = query.filter(
            ArticleModel.category == category
        )

    if search:
        query = query.filter(
            ArticleModel.title.ilike(f"%{search}%") |
            ArticleModel.content.ilike(f"%{search}%")
        )

    articles = query.order_by(
        ArticleModel.created_at.desc()
    ).offset(offset).limit(limit).all()

    return [
        {
            "id": article.id,
            "title": article.title,
            "content": article.content,
            "created_at": article.created_at,
            "is_active": article.is_active,
            "category": article.category,
            "image_url": article.image_url,
            "source_url": article.source_url
        }
        for article in articles
    ]

@app.get("/api/articles/{article_id}")
def get_article_by_id(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel | None = Depends(get_optional_user),
):
    article = db.query(ArticleModel).filter(
        ArticleModel.id == article_id
    ).first()

    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")

    if (
        not article.is_active
        and (current_user is None or current_user.role == "USER")
    ):
        raise HTTPException(status_code=404, detail="Article not found")

    return {
        "id": article.id,
        "title": article.title,
        "content": article.content,
        "created_at": article.created_at,
        "is_active": article.is_active,
        "category": article.category,
        "image_url": article.image_url,
        "source_url": article.source_url,
    }

@app.put("/api/articles/{article_id}")
def update_article(
    article_id: int,
    article: Article,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles("EDITOR", "ADMIN"))
):
    db_article = db.query(ArticleModel).filter(
        ArticleModel.id == article_id                 #Burada(satır 67, 68, 69) URL’den gelen article_id değerine göre PostgreSQL’deki haberi arıyoruz.
    ).first() 

    if db_article is None:
        return {"message": "Article not found"}

    if db_article.source_url:
        raise HTTPException(
            status_code=403,
            detail="RSS kaynaklı haberlerin içeriği düzenlenemez."
        )

    db_article.title = article.title                  #(satır 74,75)İstek gövdesinden gelen yeni başlık ve içeriği mevcut kayda atıyoruz.
    db_article.content = article.content 
    db_article.image_url = article.image_url

    db.commit()                                       #Son olarak değişiklikleri kaydediyoruz
    db.refresh(db_article)

    return {
        "message": "Article updated successfully",
        "article": {
            "id": db_article.id,
            "title": db_article.title,
            "content": db_article.content,
            "created_at": db_article.created_at
        }
    }

class ArticleUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    image_url: str | None = None

class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=8)

class UserLogin(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

class AccountDeleteRequest(BaseModel):
    password: str = Field(min_length=8)

class UserRoleUpdate(BaseModel):
    role: Literal["USER", "EDITOR", "ADMIN"]

@app.patch("/api/articles/{article_id}")
def patch_article(
    article_id: int,
    article: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles("EDITOR", "ADMIN"))
):
    db_article = db.query(ArticleModel).filter(
        ArticleModel.id == article_id
    ).first()

    if db_article is None:
        return {"message": "Article not found"}

    if db_article.source_url:
        raise HTTPException(
            status_code=403,
            detail="RSS kaynaklı haberlerin içeriği düzenlenemez."
        )

    changes = article.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(db_article, field, value)

    db.commit()
    db.refresh(db_article)

    return {
        "message": "Article partially updated",
        "article": {
            "id": db_article.id,
            "title": db_article.title,
            "content": db_article.content,
            "created_at": db_article.created_at
        }
    }

@app.patch("/api/articles/{article_id}/status")
def update_article_status(
    article_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(
        require_roles("EDITOR", "ADMIN")
    )
):
    article = db.query(ArticleModel).filter(
        ArticleModel.id == article_id
    ).first()

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    article.is_active = is_active
    db.commit()
    db.refresh(article)

    return {
        "message": "Article status updated successfully",
        "id": article.id,
        "title": article.title,
        "is_active": article.is_active
    }

@app.delete("/api/articles/{article_id}")
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles('ADMIN'))          #Şu satır, yalnızca ADMIN rolündeki kullanıcıların silme işlemi yapabilmesini sağlar
):
    db_article = db.query(ArticleModel).filter(                #db.query(...).filter(...) → Silmek istediğimiz haberi bulur.
        ArticleModel.id == article_id
    ).first()

    if db_article is None:                              #if db_article is None → Haber bulunamazsa bunu bildirir.
        return {"message": "Article not found"}

    db.delete(db_article)                               #db.delete(db_article) → Haberi silinmek üzere işaretler.
    db.commit()                                         #db.commit() → Silme işlemini veritabanına kaydeder.

    return {
        "message": "Article deleted successfully",
        "article_id": article_id
    }

@app.get("/api/search")
def search_articles(keyword: str):
    return {
        "keyword": keyword,
        "message": f"'{keyword}' kelimesi için arama yapıldı"
    }

@app.post("/api/auth/register", status_code=201)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    email = user.email.strip().lower()

    existing_user = db.query(UserModel).filter(
        UserModel.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Bu e-posta adresiyle daha önce kayıt oluşturulmuş."
        )

    verification_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(
        verification_token.encode("utf-8")
    ).hexdigest()

    db_user = UserModel(
        email=email,
        hashed_password=hash_password(user.password),
        email_verified=False,
        email_verification_token_hash=token_hash,
        email_verification_expires_at=(
            datetime.now(timezone.utc) + timedelta(hours=24)
        ),
    )

    db.add(db_user)

    try:
        db.flush()
        send_verification_email(email, verification_token)
    except Exception as error:
        db.rollback()
        print(f"Doğrulama e-postası gönderilemedi: {error}")
        raise HTTPException(
            status_code=503,
            detail="Doğrulama e-postası gönderilemedi. E-posta ayarlarını kontrol et."
        ) from error

    db.commit()

    return {
        "message": "Doğrulama bağlantısı e-posta adresine gönderildi.",
        "email": email,
    }

@app.get("/api/auth/verify-email", response_class=HTMLResponse)
def verify_email(
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    db_user = db.query(UserModel).filter(
        UserModel.email_verification_token_hash == token_hash
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=400,
            detail="Doğrulama bağlantısı geçersiz veya daha önce kullanılmış."
        )

    expires_at = db_user.email_verification_expires_at

    if expires_at is None or expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Doğrulama bağlantısının süresi dolmuş."
        )

    db_user.email_verified = True
    db_user.email_verification_token_hash = None
    db_user.email_verification_expires_at = None
    db.commit()

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    ).rstrip("/")

    return HTMLResponse(
        content=f"""
        <!doctype html>
        <html lang="tr">
          <head><meta charset="utf-8"><title>E-posta doğrulandı</title></head>
          <body>
            <h1>E-posta adresin doğrulandı.</h1>
            <p>Artık Media Space hesabına giriş yapabilirsin.</p>
            <a href="{frontend_url}/#login">Giriş sayfasına dön</a>
          </body>
        </html>
        """
    )

@app.post("/api/auth/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = db.query(UserModel).filter(
        UserModel.email == user.email
    ).first()

    if db_user is None or not verify_password(
        user.password,
        db_user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not db_user.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Giriş yapmadan önce e-posta adresini doğrulamalısın."
        )

    access_token = create_access_token(
        subject=db_user.email
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"                   #token’ın API isteklerinde Authorization: Bearer <token> biçiminde gönderileceğini belirtir.
    }

@app.post("/api/auth/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    email = request.email.strip().lower()
    db_user = db.query(UserModel).filter(
        UserModel.email == email,
        UserModel.email_verified.is_(True),
    ).first()

    # E-posta adresi kayıtlı mı bilgisini açıklamadan aynı yanıtı ver.
    response = {
        "message": "Bu e-posta kayıtlı ve doğrulanmışsa sıfırlama bağlantısı gönderildi."
    }

    if db_user is None:
        return response

    now = datetime.now(timezone.utc)

    # Tekrar tekrar e-posta gönderilmesini önlemek için 1 dakika bekle.
    if db_user.password_reset_expires_at is not None:
        previous_expiry = db_user.password_reset_expires_at
        if previous_expiry.tzinfo is None:
            previous_expiry = previous_expiry.replace(tzinfo=timezone.utc)

        if previous_expiry - timedelta(minutes=29) > now:
            return response

    reset_token = secrets.token_urlsafe(32)
    db_user.password_reset_token_hash = hashlib.sha256(
        reset_token.encode("utf-8")
    ).hexdigest()
    db_user.password_reset_expires_at = now + timedelta(minutes=30)

    try:
        send_password_reset_email(email, reset_token)
        db.commit()
    except Exception as error:
        db.rollback()
        print(f"Şifre sıfırlama e-postası gönderilemedi: {error}")
        raise HTTPException(
            status_code=503,
            detail="E-posta gönderilemedi. Sunucu e-posta ayarlarını kontrol et.",
        ) from error

    return response

@app.post("/api/auth/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    token_hash = hashlib.sha256(
        request.token.encode("utf-8")
    ).hexdigest()

    db_user = db.query(UserModel).filter(
        UserModel.password_reset_token_hash == token_hash
    ).first()

    if db_user is None or db_user.password_reset_expires_at is None:
        raise HTTPException(
            status_code=400,
            detail="Bağlantı geçersiz veya süresi dolmuş.",
        )

    expires_at = db_user.password_reset_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Bağlantı geçersiz veya süresi dolmuş.",
        )

    db_user.hashed_password = hash_password(request.new_password)
    db_user.password_reset_token_hash = None
    db_user.password_reset_expires_at = None
    db.commit()

    return {"message": "Şifren güncellendi. Yeni şifrenle giriş yapabilirsin."}

@app.post("/api/auth/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    generic_response = {
        "message": (
            "Bu e-posta doğrulanmış bir hesaba aitse "
            "şifre sıfırlama bağlantısı gönderildi."
        )
    }

    email = request.email.strip().lower()
    db_user = db.query(UserModel).filter(
        UserModel.email == email
    ).first()

    if db_user is None or not db_user.email_verified:
        return generic_response

    now = datetime.now(timezone.utc)
    old_expiry = db_user.password_reset_expires_at

    # Aynı hesaba art arda e-posta gönderilmesini sınırlar.
    if old_expiry is not None and old_expiry > now:
        last_sent_at = old_expiry - timedelta(minutes=30)
        if now - last_sent_at < timedelta(minutes=1):
            return generic_response

    reset_token = secrets.token_urlsafe(32)
    db_user.password_reset_token_hash = hashlib.sha256(
        reset_token.encode("utf-8")
    ).hexdigest()
    db_user.password_reset_expires_at = now + timedelta(minutes=30)

    try:
        db.flush()
        send_password_reset_email(email, reset_token)
        db.commit()
    except Exception as error:
        db.rollback()
        print(f"Şifre sıfırlama e-postası gönderilemedi: {error}")

    return generic_response

@app.post("/api/auth/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    token_hash = hashlib.sha256(
        request.token.encode("utf-8")
    ).hexdigest()

    db_user = db.query(UserModel).filter(
        UserModel.password_reset_token_hash == token_hash
    ).first()

    if (
        db_user is None
        or db_user.password_reset_expires_at is None
        or db_user.password_reset_expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=400,
            detail="Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
        )

    db_user.hashed_password = hash_password(request.new_password)
    db_user.password_reset_token_hash = None
    db_user.password_reset_expires_at = None
    db.commit()

    return {"message": "Şifren başarıyla güncellendi."}

'''
(satır 238-264 çalışma mantığı)
Login işlemi şu sırayla çalışacak:
1. E-posta adresini veritabanında arayacak.
2. Kullanıcı bulunamazsa veya parola yanlışsa 401 Unauthorized döndürecek.
3. E-posta ve parola doğruysa kullanıcıya özel JWT oluşturacak.
4. Token’ı istemciye gönderecek.
'''

@app.get("/api/auth/me")
def get_me(
    current_user: UserModel = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at
    }

@app.delete("/api/auth/me")
def delete_my_account(
    request: AccountDeleteRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Şifre yanlış.",
        )

    if current_user.role == "ADMIN":
        other_admin_count = (
            db.query(UserModel)
            .filter(
                UserModel.role == "ADMIN",
                UserModel.id != current_user.id,
            )
            .count()
        )

        if other_admin_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Sistemde başka bir admin hesabı olmadan bu hesabı silemezsin.",
            )

    db.delete(current_user)
    db.commit()

    return {"message": "Hesabın silindi."}

@app.get("/api/admin/test")
def admin_test(
    current_user: UserModel = Depends(require_roles("ADMIN"))                    #depends: Yalnızca ADMIN rolüne sahip kullanıcıların erişmesine izin veriyor.
):
    return {
        "message": "Welcome, Admin!",
        "email": current_user.email,
        "role": current_user.role
    }

@app.get("/api/admin/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles("ADMIN")),
):
    users = db.query(UserModel).order_by(UserModel.email).all()

    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
        }
        for user in users
    ]

@app.patch("/api/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles("ADMIN")),
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id and role_update.role != "ADMIN":
        raise HTTPException(
            status_code=400,
            detail="Kendi admin rolünü değiştiremezsin.",
        )

    if user.role == "ADMIN" and role_update.role != "ADMIN":
        other_admin_count = (
            db.query(UserModel)
            .filter(
                UserModel.role == "ADMIN",
                UserModel.id != user.id,
            )
            .count()
        )

        if other_admin_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Sistemde en az bir admin hesabı kalmalı.",
            )

    user.role = role_update.role
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
    }

@app.delete("/api/admin/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_roles("ADMIN")),
):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Kendi hesabını silemezsin.",
        )

    if user.role == "ADMIN":
        other_admin_count = (
            db.query(UserModel)
            .filter(
                UserModel.role == "ADMIN",
                UserModel.id != user.id,
            )
            .count()
        )

        if other_admin_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Sistemde en az bir admin hesabı kalmalı.",
            )

    db.delete(user)
    db.commit()

    return {"message": "Kullanıcı silindi."}

@app.post("/api/rss/import")                        #RSS haberlerini içe aktarır.
def import_rss(
    db: Session = Depends(get_db),                  #get_db: PostgreSQL bağlantısını sağlar.
    current_user: UserModel = Depends(require_roles("EDITOR", "ADMIN"))                #require_roles("EDITOR", "ADMIN"): Yalnızca EDITOR ve ADMIN rollerine izin verir.
):
    return import_rss_articles(db)                  #mport_rss_articles(db): Haberleri alıp veritabanına kaydeder.