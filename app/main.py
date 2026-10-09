from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Article as ArticleModel
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="Media Platform API",
    description="Media content management and tracking platform",
    version="1.0.0"
)

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
