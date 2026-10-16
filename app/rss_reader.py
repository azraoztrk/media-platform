import feedparser

RSS_URL = "https://www.haberturk.com/rss"

feed = feedparser.parse(RSS_URL)                            #RSS akışını okuyup Python nesnesine dönüştürür.

print("RSS başlığı:", feed.feed.get("title", "Başlık bulunamadı"))
print("Haber sayısı:", len(feed.entries))

for entry in feed.entries[:5]:                              #feed.entries: Akıştaki haberleri içerir. [:5]: İlk beş haberi seçer.
    print("\nBaşlık:", entry.get("title", "Başlık yok"))
    print("Link:", entry.get("link", "Link yok"))           #entry.get(...): İlgili alan mevcut değilse hata vermek yerine varsayılan bir değer döndürür.