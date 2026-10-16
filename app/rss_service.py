import feedparser
from sqlalchemy.orm import Session

from app.models import Article

RSS_URL = "https://www.haberturk.com/rss"


def import_rss_articles(db: Session):
    feed = feedparser.parse(RSS_URL)

    added_count = 0
    skipped_count = 0

    for entry in feed.entries:
        title = entry.get("title", "").strip()
        link = entry.get("link", "").strip()
        content = entry.get("summary", "").strip()

        # Başlık veya bağlantı yoksa haberi atla.
        if not title or not link:
            skipped_count += 1
            continue

        # Başlığı veritabanındaki sütun uzunluğuna uygun tut.
        title = title[:255]

        # Aynı haber daha önce eklenmiş mi kontrol et.
        existing_article = (
            db.query(Article)
            .filter(Article.source_url == link)
            .first()
        )

        if existing_article:
            skipped_count += 1
            continue

        article = Article(
            title=title,
            content=content or title,
            source_url=link,
            is_active=True,
        )

        db.add(article)
        added_count += 1

    db.commit()

    return {
        "message": "RSS import completed",
        "added": added_count,
        "skipped": skipped_count,
    }

'''
Kod ne yapıyor?

1. Habertürk RSS akışını okuyor.
2. Her haberin başlığını, bağlantısını ve özetini alıyor.
3. Başlığı veya bağlantısı eksik haberleri atlıyor.
4. Aynı bağlantıya sahip bir haber veritabanında varsa tekrar eklemiyor.
5. Yeni haberleri articles tablosuna kaydediyor.
6. Kaç haberin eklendiğini ve kaçının atlandığını bildiriyor.
'''