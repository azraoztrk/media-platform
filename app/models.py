from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, UniqueConstraint

from sqlalchemy.sql import func

from app.database import Base

#articles tablosunu temsil eden sınıf
class Article(Base):
    __tablename__ = "articles"      #Kullanılacak tablo adı    

    id = Column(Integer, primary_key=True, index=True)     #Otomatik artan primary key
    title = Column(String(255), nullable=False)     #En fazla 255 karakterlik başlık
    content = Column(Text, nullable=False)      #Uzun metin içeriği
    created_at = Column(DateTime, server_default=func.now())      #Oluşturulma tarihi
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    source_url = Column(String(500), unique=True, nullable=True)
    category = Column(String(100), nullable=False, default="Gündem", server_default="Gündem")
    image_url = Column(String(1000), nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)                          #Her kullanıcıya benzersiz bir kimlik verir.
    email = Column(String(255), unique=True, nullable=False, index=True)        #Kullanıcının e-posta adresini saklar.   -   #unique=True: Aynı e-posta adresiyle birden fazla hesap oluşturulmasını veritabanı seviyesinde engeller.
    hashed_password = Column(String(255), nullable=False)                       #Parolanın kendisini değil, güvenli biçimde hash’lenmiş değerini saklar.
    role = Column(
        String(20),
        nullable=False,                                    #Rol alanının boş bırakılmasını engeller.
        default="USER",                                    #SQLAlchemy üzerinden yeni bir kullanıcı oluşturulurken rol belirtilmezse USER kullanılır.
        server_default="USER"                              #Veritabanında rol belirtilmeden kayıt oluşturulursa PostgreSQL varsayılan olarak USER değerini kullanır.
    )
    created_at = Column(DateTime, server_default=func.now())                    #Kullanıcının oluşturulma zamanını kaydeder.

    email_verified = Column(Boolean, nullable=False, default=True, server_default="true")
    email_verification_token_hash = Column(String(64), nullable=True)
    email_verification_expires_at = Column(DateTime(timezone=True), nullable=True)
    password_reset_token_hash = Column(String(64), nullable=True)
    password_reset_expires_at = Column(DateTime(timezone=True), nullable=True)

class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(80), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "name",
            name="uq_collections_user_name",
        ),
    )


class CollectionArticle(Base):
    __tablename__ = "collection_articles"

    collection_id = Column(
        Integer,
        ForeignKey("collections.id", ondelete="CASCADE"),
        primary_key=True,
    )
    article_id = Column(
        Integer,
        ForeignKey("articles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    added_at = Column(DateTime(timezone=True), server_default=func.now())