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

@app.post("/api/articles")
def create_article(article: Article):
    return {
        "message": "Article created successfully",
        "article": article
    }

@app.get("/api/articles")
def get_articles():
    return [
        {"id": 1, "title": "İlk haber"},
        {"id": 2, "title": "İkinci haber"}
    ]

@app.put("/api/articles/{article_id}")
def update_article(article_id: int, article: Article):
    return {
        "message": "Article updated successfully",
        "article_id": article_id,
        "article": article
    }


class ArtcileUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

@app.patch("/api/articles/{article_id}")
def patch_article(article_id: int, article: ArtcileUpdate):
    return {
        "message": "Article partially updated",
        "article_id": article_id,
        "changes": article
    }
@app.delete("/api/articles/{article_id}")
def delete_article(article_id: int):
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
