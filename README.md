# NewsTrack

NewsTrack, Habertürk RSS akışından haberleri alıp kategorilere ayıran bir haber takip platformudur. Kullanıcılar haberleri arayabilir, favorilerine ekleyebilir ve kendi isimlendirdikleri koleksiyonlarda düzenleyebilir.

## Özellikler

- Habertürk RSS akışından haber içe aktarma
- Haberleri kategoriye göre filtreleme, arama ve sayfalama
- Arama önerileri ve haber detay sayfaları
- Kaynak haber bağlantılarına yönlendirme
- E-posta adresi doğrulamalı kullanıcı kaydı ve giriş
- E-posta yoluyla şifre sıfırlama
- Hesaba özel favori haberler
- İsimli haber koleksiyonları oluşturma, yeniden adlandırma ve silme
- Haberleri koleksiyonlara ekleme ve koleksiyonlardan çıkarma
- USER, EDITOR ve ADMIN kullanıcı rolleri
- Editör ve admin için haber yönetim paneli
- Admin için kullanıcı rolleri yönetimi ve güvenli kullanıcı silme
- Hugging Face modeliyle AI destekli haber kategorisi tahmini

RSS kaynaklı haberlerin içeriği yönetim panelinden düzenlenemez. Editörler kendi oluşturdukları haberleri yönetebilir. Manuel haberlerde görsel URL’si isteğe bağlıdır. Kaynak haber bağlantısı korunur.

Favoriler tarayıcıda hesaba özel saklanır. Koleksiyonlar kullanıcı hesabına bağlı olarak veritabanında saklanır.

## Teknolojiler

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI, SQLAlchemy
- **Veritabanı:** PostgreSQL
- **Kimlik doğrulama:** JWT
- **E-posta:** Gmail SMTP
- **AI sınıflandırma:** Hugging Face Transformers, PyTorch
- **RSS ve içerik işleme:** feedparser, Requests, Beautiful Soup

## Gereksinimler

- Python 3.13
- Node.js ve npm
- PostgreSQL

## Yerel kurulum

### 1. Depoyu klonla

```bash
git clone https://github.com/azraoztrk/media-platform.git
cd media-platform
```

### 2. Python ortamını hazırla

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

### 3. Veritabanını ve ortam değişkenlerini ayarla

PostgreSQL’de `media_platform` adlı bir veritabanı oluştur. Veritabanına bağlanacak kullanıcının tabloları oluşturma ve kullanma yetkisi olmalıdır.

Proje kökünde `.env` adlı dosya oluşturup kendi bağlantı ve e-posta bilgilerini gir:

```env
DATABASE_URL=postgresql+psycopg://KULLANICI:SIFRE@localhost:5432/media_platform
JWT_SECRET_KEY=uzun_ve_tahmin_edilmesi_zor_bir_gizli_anahtar

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_APP_PASSWORD=your-gmail-app-password

FRONTEND_URL=http://localhost:5173
BACKEND_BASE_URL=http://127.0.0.1:8000
```

Gmail üzerinden e-posta göndermek için Google hesabında iki adımlı doğrulamayı etkinleştirip uygulama şifresi oluştur. `.env` dosyasını veya uygulama şifresini GitHub’a gönderme.

### 4. Veritabanı tablolarını oluştur

Proje kök dizininde çalıştır:

```bash
python -c "from app.database import Base, engine; import app.models; Base.metadata.create_all(bind=engine)"
```

Bu komut eksik tabloları oluşturur. Mevcut tablolara yeni alan eklemez; var olan bir veritabanında şema değişiklikleri ayrıca uygulanmalıdır.

### 5. Backend’i başlat

Proje kök dizininde çalıştır:

```bash
uvicorn app.main:app --reload
```

- Backend: <http://127.0.0.1:8000>
- API belgeleri: <http://127.0.0.1:8000/docs>

### 6. Frontend’i başlat

Yeni bir terminal açıp proje klasöründen frontend’e geç:

```bash
cd frontend
npm install
npm run dev
```

Vite’ın terminalde gösterdiği yerel adresi tarayıcıda aç.

## AI modeli

Kategori tahmini için `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` modeli kullanılır. Model ilk kullanımda Hugging Face üzerinden indirilir. Model dosyası yaklaşık 558 MB boyutundadır ve indirme sırasında internet bağlantısı gerekir. Apple Silicon cihazlarda MPS kullanılabilir; aksi durumda CPU kullanılır.

## Kullanıcı rolleri

- **USER:** Haberleri görüntüleyebilir, favori ve koleksiyon özelliklerini kullanabilir.
- **EDITOR:** Kendi oluşturduğu haberleri yönetebilir.
- **ADMIN:** Haber yönetimi, kullanıcı rolleri ve kullanıcı hesapları üzerinde yönetim işlemleri yapabilir.

Yeni kayıt olan hesaplar varsayılan olarak USER rolüyle oluşturulur. EDITOR ve ADMIN yetkileri admin tarafından verilir. Sistemdeki son admin hesabının silinmesine izin verilmez.

## Kontroller

Backend dosyalarının sözdizimini kontrol et:

```bash
python -m py_compile app/main.py app/rss_service.py app/models.py app/email_service.py
```

Python paket uyumluluğunu kontrol et:

```bash
python -m pip check
```

Frontend üretim derlemesini kontrol et:

```bash
cd frontend
npm run build
```
