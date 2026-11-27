# NewsTrack

NewsTrack, RSS kaynaklarından haberleri alıp kategorilere ayıran; kullanıcıların haberleri arayıp okuyabildiği bir haber platformu projesidir.

## Özellikler

- Habertürk RSS akışından haber içe aktarma
- Haberleri kategoriye göre filtreleme ve arama
- Sayfalama ve arama önerileri
- Haber detayları ve kaynak bağlantısı
- JWT tabanlı kullanıcı kaydı ve girişi
- USER, EDITOR ve ADMIN rolleri
- Favorilere haber ekleme
- Editör ve admin için haber yönetim paneli
- Admin için kullanıcı rolü değiştirme ve güvenli kullanıcı silme
- Başlıkları sınıflandırmak için yapay zekâ destekli kategori tahmini

RSS kaynaklı haberlerin içeriği yönetim panelinden düzenlenemez. Editörler manuel eklenen haberleri yönetebilir. Manuel haberlerde görsel URL’si isteğe bağlıdır.

## Teknolojiler

**Frontend:** React, TypeScript, Vite  
**Backend:** Python, FastAPI, SQLAlchemy  
**Veritabanı:** PostgreSQL  
**Kimlik doğrulama:** JWT  
**AI sınıflandırma:** Hugging Face Transformers, PyTorch  
**RSS ve içerik işleme:** feedparser, Requests, Beautiful Soup

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

PostgreSQL’de boş bir veritabanı oluştur. Proje kökünde `.env` adlı dosya oluşturup kendi bağlantı bilgilerini gir:

```env
DATABASE_URL=postgresql+psycopg://KULLANICI:SIFRE@localhost:5432/media_platform
JWT_SECRET_KEY=uzun_ve_tahmin_edilmesi_zor_bir_gizli_anahtar
```

`.env` dosyasını GitHub’a gönderme; bu dosya gizli bilgiler içerir.

Veritabanı tablolarını oluşturmak için proje kökünde çalıştır:

```bash
python -c "from app.database import Base, engine; import app.models; Base.metadata.create_all(bind=engine)"
```

### 4. Backend’i başlat

Proje kökünde çalıştır:

```bash
uvicorn app.main:app --reload
```

Backend şu adreste çalışır:

```text
http://127.0.0.1:8000
```

API belgeleri:

```text
http://127.0.0.1:8000/docs
```

### 5. Frontend’i başlat

Yeni bir terminal açıp frontend klasörüne geç:

```bash
cd media-platform/frontend
npm install
npm run dev
```

Vite’ın terminalde gösterdiği yerel adresi tarayıcıda aç.

## AI modeli hakkında

Kategori tahmini, `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli` modeliyle yapılır. Model ilk kullanımda Hugging Face üzerinden indirilir; model dosyası yaklaşık 558 MB boyutundadır ve ilk indirme için internet bağlantısı gerekir. Apple Silicon cihazlarda MPS kullanılabilir; aksi durumda CPU kullanılır.

## Kullanıcı rolleri

Yeni kayıt olan hesaplar varsayılan olarak USER rolüyle oluşturulur. EDITOR ve ADMIN yetkileri mevcut bir admin tarafından verilir. İlk admin hesabı veritabanında yetkili şekilde tanımlanmalıdır.

## Kontroller

Backend sözdizimi kontrolü:

```bash
python -m py_compile app/main.py app/rss_service.py
```

Python bağımlılık kontrolü:

```bash
python -m pip check
```

Frontend üretim derlemesi:

```bash
cd frontend
npm run build
```
