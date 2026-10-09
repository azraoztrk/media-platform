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