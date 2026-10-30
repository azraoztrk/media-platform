import feedparser
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from app.models import Article
from urllib.parse import urlparse

RSS_URL = 'https://www.haberturk.com/rss'

def get_article_image(url: str):
    try:
        response = requests.get(
            url,
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=15,
        )
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        image_tag = soup.find("meta", property="og:image")

        if image_tag:
            return image_tag.get("content")

    except requests.RequestException as error:
        print(f"Görsel alınamadı: {url} - {error}")

    return None

def get_article_category(url: str, title: str = "") -> str:
    path = urlparse(url).path.lower()
    sections = path.strip("/").split("/")

    category_map = {
        "gundem": "Gündem",
        "spor": "Spor",
        "ekonomi": "İş Dünyası",
        "teknoloji": "Teknoloji",
        "bilim": "Bilim",
        "kultur-sanat": "Kültür & Sanat",
        "magazin": "Kültür & Sanat",
        "dunya": "Gündem",
    }

    technology_keywords = [
        "yapay zeka",
        "yapay zekâ",
        "teknoloji",
        "siber güvenlik",
        "akıllı telefon",
        "robot",
        "tesla",
        "elektrikli araç",
        "şarj istasyonu",
        "batarya",
        "pil",
        "otonom araç",
        "çip",
        "işlemci",
        "apple",
        "samsung",
        "google",
        "microsoft",
        "makine öğrenmesi",
        "veri merkezi",
        "uygulama",
    ]

    science_keywords = [
        "bilim",
        "bilim insanı",
        "bilimsel araştırma",
        "bilimsel keşif",
        "astronomi",
        "uzay araştırmaları",
        "nasa",
        "gezegen",
        "galaksi",
        "evren",
        "kara delik",
        "kuantum",
        "fizik",
        "kimya",
        "biyoloji",
        "arkeoloji",
        "fosil",
        "iklim araştırması",
        "laboratuvar",
    ]

    # Başlığı önce kontrol et.
    title_lower = title.casefold()

    if any(word in title_lower for word in technology_keywords):
        return "Teknoloji"

    if any(word in title_lower for word in science_keywords):
        return "Bilim"

    # Başlık yeterli değilse URL'nin bölümünü kontrol et.
    for section in sections[:-1]:
        if section in category_map:
            return category_map[section]

    # Bazı haberlerin kategorisi URL'nin sonundaki ifadede bulunabilir.
    last_section = sections[-1] if sections else ""

    if last_section.endswith("-teknoloji"):
        return "Teknoloji"

    if last_section.endswith("-bilim"):
        return "Bilim"

    return "Gündem"

def import_rss_articles(db: Session):
    feed = feedparser.parse(RSS_URL)

    added_count = 0
    skipped_count = 0
    updated_images_count = 0

    # Görseli eksik eski haberleri tamamla.
    articles_without_images = (
        db.query(Article)
        .filter(
            Article.image_url.is_(None) | (Article.image_url == ""),
            Article.source_url.isnot(None),
        )
        .all()
    )

    for article in articles_without_images:
        image_url = get_article_image(article.source_url)

        if image_url:
            article.image_url = image_url
            updated_images_count += 1

    db.commit()

    for entry in feed.entries:
        title = entry.get("title", "").strip()
        link = entry.get("link", "").strip()
        content = entry.get("summary", "").strip()

        # Başlık veya bağlantı yoksa haberi atla.
        if not title or not link:
            skipped_count += 1
            continue
        title = title[:255]
        # RSS içindeki görsel bağlantısını al.
        image_url = None
        media_content = entry.get("media_content", [])
        if media_content:
            image_url = media_content[0].get("url")
        if not image_url:
            media_thumbnail = entry.get("media_thumbnail", [])
            if media_thumbnail:
                image_url = media_thumbnail[0].get("url")
        # Aynı bağlantıya sahip haber var mı kontrol et.
        existing_article = (
            db.query(Article)
            .filter(Article.source_url == link)
            .first()
        )
        if existing_article:
            # Haberin kategorisini yeni kurallara göre güncelle.
            existing_article.category = get_article_category(link, title)

            # Yalnızca görseli eksik haberleri güncelle.
            if not existing_article.image_url and image_url:
                existing_article.image_url = image_url
                updated_images_count += 1

            skipped_count += 1
            continue
        # Yeni haberi kaydet.
        article = Article(
            title=title,
            content=content or title,
            source_url=link,
            category=get_article_category(link, title),
            image_url=image_url,
            is_active=True,
        )
        db.add(article)
        added_count += 1
    db.commit()
    return {
        "message": "RSS import completed",
        "added": added_count,
        "updated_images": updated_images_count,
        "skipped": skipped_count,
    }