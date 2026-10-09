import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

#.env dosyasındaki değişkenleri yükler.
load_dotenv() 

#Veritabanı bağlantı adresini okur.
DATABASE_URL = os.getenv("DATABASE_URL") 

#SQLAlchemy ile veritabanı bağlantı motorunu oluşturur.
engine = create_engine(DATABASE_URL) 

#Veritabanında sorgu ve veri işlemleri yapmak için oturum üretir.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

#Veritabanı tablolarını Python sınıflarıyla tanımlamak için temel oluşturur.
Base = declarative_base()

def get_db():
    db = SessionLocal()     #Yeni bir veritabanı oturumu oluşturur.
    try:
        yield db            #Oturumu FastAPI endpoint’ine verir.
    finally:
        db.close()          #İşlem başarılı olsa da hata alsa da oturumun kapatılmasını sağlar.