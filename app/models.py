from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base

#articles tablosunu temsil eden sınıf
class Article(Base):
    __tablename__ = "articles"      #Kullanılacak tablo adı    

    id = Column(Integer, primary_key=True, index=True)     #Otomatik artan primary key
    title = Column(String(255), nullable=False)     #En fazla 255 karakterlik başlık
    content = Column(Text, nullable=False)      #Uzun metin içeriği
    created_at = Column(DateTime, server_default=func.now())      #Oluşturulma tarihi


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)                          #Her kullanıcıya benzersiz bir kimlik verir.
    email = Column(String(255), unique=True, nullable=False, index=True)        #Kullanıcının e-posta adresini saklar.   -   #unique=True: Aynı e-posta adresiyle birden fazla hesap oluşturulmasını veritabanı seviyesinde engeller.
    hashed_password = Column(String(255), nullable=False)                       #Parolanın kendisini değil, güvenli biçimde hash’lenmiş değerini saklar.
    created_at = Column(DateTime, server_default=func.now())                    #Kullanıcının oluşturulma zamanını kaydeder.

