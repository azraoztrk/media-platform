import jwt
from app.security import (
    hash_password,                                              #hash_password, kayıt sırasında parolayı hash’ler. verify_password: Giriş sırasında parolayı doğrular. create_access_token: Bilgileri doğru olan kullanıcıya JWT üretir.
    verify_password,
    create_access_token,
    decode_access_token
)   
from sqlalchemy.orm import Session
from app.database import get_db
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models import Article as ArticleModel, User as UserModel      #UserModel, veritabanındaki kullanıcı tablosuna erişmemizi sağlar.
from fastapi import FastAPI, Depends, HTTPException                    #HTTPException, örneğin aynı e-posta adresiyle tekrar kayıt yapılmasını uygun bir HTTP hata koduyla bildirmemizi sağlar.
from pydantic import BaseModel, Field                                  #Field, parola için minimum uzunluk belirlememizi sağlar.

app = FastAPI(
    title="Media Platform API",
    description="Media content management and tracking platform",
    version="1.0.0"
)
bearer_scheme = HTTPBearer()

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

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

#API’ye gönderilecek haberin hangi bilgileri içermesi gerektiğini tanımlıyoruz.
class Article(BaseModel):
    title: str
    content: str

@app.post("/api/articles")                        #Depends: Veritabanı oturumunu endpoint’e sağlar.
def create_article(article: Article, db: Session = Depends(get_db)):
    db_article = ArticleModel(         #-->Yeni bir haber nesnesi oluşturur.
        title=article.title,
        content=article.content
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
def get_articles(db: Session = Depends(get_db)):
    articles = db.query(ArticleModel).order_by(
        ArticleModel.created_at.desc()
    ).all()

    return [
        {
            "id": article.id,
            "title": article.title,
            "content": article.content,
            "created_at": article.created_at
        }
        for article in articles
    ]

@app.put("/api/articles/{article_id}")
def update_article(
    article_id: int,
    article: Article,
    db: Session = Depends(get_db)
):
    db_article = db.query(ArticleModel).filter(
        ArticleModel.id == article_id                 #Burada(satır 67, 68, 69) URL’den gelen article_id değerine göre PostgreSQL’deki haberi arıyoruz.
    ).first() 

    if db_article is None:
        return {"message": "Article not found"}

    db_article.title = article.title                  #(satır 74,75)İstek gövdesinden gelen yeni başlık ve içeriği mevcut kayda atıyoruz.
    db_article.content = article.content 

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

class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=8)

class UserLogin(BaseModel):
    email: str
    password: str

@app.patch("/api/articles/{article_id}")
def patch_article(
    article_id: int,
    article: ArticleUpdate,
    db: Session = Depends(get_db)
):
    db_article = db.query(ArticleModel).filter(
        ArticleModel.id == article_id
    ).first()

    if db_article is None:
        return {"message": "Article not found"}

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

@app.delete("/api/articles/{article_id}")
def delete_article(
    article_id: int,
    db: Session = Depends(get_db)
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
    existing_user = db.query(UserModel).filter(
        UserModel.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    db_user = UserModel(
        email=user.email,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "created_at": db_user.created_at
        }
    }

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

    access_token = create_access_token(
        subject=db_user.email
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"                   #token’ın API isteklerinde Authorization: Bearer <token> biçiminde gönderileceğini belirtir.
    }

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

@app.get("/api/admin/test")
def admin_test(
    current_user: UserModel = Depends(require_roles("ADMIN"))                    #depends: Yalnızca ADMIN rolüne sahip kullanıcıların erişmesine izin veriyor.
):
    return {
        "message": "Welcome, Admin!",
        "email": current_user.email,
        "role": current_user.role
    }