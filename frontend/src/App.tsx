import { useEffect, useState } from 'react'
import './App.css'

const categories = [
  'Gündem',
  'Teknoloji',
  'Bilim',
  'İş Dünyası',
  'Kültür & Sanat',
  'Spor',
]

const trendingArticles = [
  {
    number: '01',
    category: 'TEKNOLOJİ',
    title: 'Yapay zekâ yazılım dünyasını nasıl değiştiriyor?',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=85',
  },
  {
    number: '02',
    category: 'BİLİM',
    title: 'Bilim dünyasında yeni keşifler',
    image:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=500&q=85',
  },
  {
    number: '03',
    category: 'İŞ DÜNYASI',
    title: 'Dijital dönüşümün yeni dönemi',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=500&q=85',
  },
]

const articles = [
  {
    category: 'TEKNOLOJİ',
    title: 'Yapay zekâ çağında yazılım geliştirmenin değişen yüzü',
    description:
      'Yeni araçlar, değişen alışkanlıklar ve yazılım geliştirmenin geleceği.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85',
    time: '6 dk.',
  },
  {
    category: 'BİLİM',
    title: 'Evren hakkında bildiklerimizi değiştiren keşifler',
    description:
      'Bilim insanlarının araştırmaları geleceğe dair yeni sorular doğuruyor.',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=85',
    time: '4 dk.',
  },
  {
    category: 'İŞ DÜNYASI',
    title: 'Geleceğin çalışma hayatı nasıl şekilleniyor?',
    description:
      'Teknoloji, yeni çalışma biçimleri ve değişen iş kültürü.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85',
    time: '5 dk.',
  },
  {
    category: 'KÜLTÜR & SANAT',
    title: 'Şehirlerin hikâyelerini anlatan mekânlar',
    description:
      'Mimari ve kültürel hafıza arasındaki görünmez bağlantılar.',
    image:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85',
    time: '3 dk.',
  },
  {
    category: 'BİLİM',
    title: 'Okyanusların derinliklerinde keşfedilmeyi bekleyenler',
    description:
      'Dünyamızın henüz tam olarak tanımadığımız ekosistemleri.',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85',
    time: '7 dk.',
  },
  {
    category: 'GÜNDEM',
    title: 'Daha yaşanabilir şehirler için yeni fikirler',
    description:
      'Kent yaşamını dönüştüren tasarımlar ve sürdürülebilir çözümler.',
    image:
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85',
    time: '5 dk.',
  },
]

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 4.5h11v16l-5.5-3.8-5.5 3.8z" />
    </svg>
  )
}

type AuthPageProps = {
  mode: 'login' | 'register'
}

function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login'

  return (
    <div className="auth-page">
      <header className="auth-header">
        <a className="brand" href="#">
          media space<span>.</span>
        </a>

        <a className="auth-back-link" href="#">
          ← Ana sayfaya dön
        </a>
      </header>

      <main className="auth-main">
        <div className="auth-intro">
          <span className="section-eyebrow">
            MEDIA SPACE ÜYELİĞİ
          </span>

          <h1>
            {isLogin ? (
              <>
                Yeniden
                <br />
                hoş geldin.
              </>
            ) : (
              <>
                Hikâyelerin
                <br />
                bir parçası ol.
              </>
            )}
          </h1>

          <p>
            {isLogin
              ? 'Dünyayı değiştiren fikirleri ve hikâyeleri keşfetmeye devam et.'
              : 'Kendi hesabını oluştur, ilgini çeken hikâyeleri keşfet.'}
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={(event) => event.preventDefault()}
        >
          {!isLogin && (
            <div className="auth-name-fields">
              <label>
                Ad
                <input
                  type="text"
                  name="firstName"
                  placeholder="Adın"
                  autoComplete="given-name"
                  required
                />
              </label>

              <label>
                Soyad
                <input
                  type="text"
                  name="lastName"
                  placeholder="Soyadın"
                  autoComplete="family-name"
                  required
                />
              </label>
            </div>
          )}

          <label>
            E-posta adresi
            <input
              type="email"
              name="email"
              placeholder="ornek@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Şifre
            <input
              type="password"
              name="password"
              placeholder="Şifreni gir"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={8}
              required
            />
          </label>

          {!isLogin && (
            <label>
              Şifre tekrarı
              <input
                type="password"
                name="confirmPassword"
                placeholder="Şifreni tekrar gir"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          )}

          {isLogin && (
            <a className="forgot-password" href="#forgot-password">
              Şifremi unuttum
            </a>
          )}

          <button className="auth-submit" type="submit">
            {isLogin ? 'Giriş yap' : 'Hesap oluştur'}
            <span aria-hidden="true">↗</span>
          </button>

          <p className="auth-switch">
            {isLogin ? 'Henüz hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
            <a href={isLogin ? '#register' : '#login'}>
              {isLogin ? 'Kayıt ol' : 'Giriş yap'}
            </a>
          </p>
        </form>

        <div className="auth-bottom-note">
          FİKİRLERİN VE HİKÂYELERİN BULUŞMA NOKTASI
        </div>
      </main>

      <footer className="auth-footer">
        <span>© 2026 MEDIA SPACE</span>
        <span>Dünyaya farklı bir açıdan bak.</span>
      </footer>
    </div>
  )
}

function ArticleDetail() {
  const [isFavorite, setIsFavorite] = useState(false)
  return (
    <div className="article-page">
      <header className="article-header">
        <a className="brand" href="#">
          media space<span>.</span>
        </a>
        <a className="article-back-link" href="#">
          ← Ana sayfaya dön
        </a>
      </header>
      <main className="article-main">
        <div className="article-heading">
          <span className="section-eyebrow">
            TEKNOLOJİ · YAPAY ZEKÂ
          </span>
          <h1>
            Yapay Zekâ Çağında
            <br />
            Yazılım Geliştirmek
          </h1>
          <p className="article-spot">
            Yapay zekâ yazılım geliştirme süreçlerini dönüştürüyor.
            Peki bu dönüşüm, yazılımcıların çalışma biçimini ve
            problem çözme yaklaşımını nasıl etkiliyor?
          </p>
          <div className="article-meta">
            <div>
              <span className="article-meta-label">YAZAR</span>
              <span>Media Space Editörleri</span>
            </div>
            <div>
              <span className="article-meta-label">YAYIN TARİHİ</span>
              <span>16 Ekim 2026</span>
            </div>
            <div>
              <span className="article-meta-label">OKUMA SÜRESİ</span>
              <span>4 dakika</span>
            </div>
          </div>
        </div>
        <img
          className="article-cover"
          src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85"
          alt="Yapay zekâ ve dijital teknolojileri temsil eden görsel"
        />
        <div className="article-content">
          <div className="article-content-top">
            <span className="section-eyebrow">MAKALE</span>
            <button
              className={`article-favorite ${isFavorite ? 'is-favorite' : ''}`}
              onClick={() => setIsFavorite(!isFavorite)}
              type="button"
            >
              {isFavorite ? '♥ Favorilere eklendi' : '♡ Favorilere ekle'}
            </button>
          </div>
          <p className="article-lead">
            Yazılım geliştirme, yalnızca kod yazmaktan ibaret değil.
            Problemleri anlamak, doğru çözümleri tasarlamak ve
            geliştirilen sistemleri sürdürülebilir hâle getirmek
            de bu sürecin önemli parçaları.
          </p>
          <h2>Yazılım geliştirme süreci nasıl değişiyor?</h2>
          <p>
            Yapay zekâ destekli araçlar, geliştiricilerin kod üretme,
            hata ayıklama ve teknik dokümantasyon hazırlama gibi
            görevlerinde yardımcı olabiliyor. Böylece bazı rutin
            işler daha kısa sürede tamamlanabiliyor.
          </p>
          <p>
            Ancak bir aracın kod üretebilmesi, üretilen kodun her
            durumda doğru, güvenli veya ihtiyaçlara uygun olduğu
            anlamına gelmiyor. Geliştiricinin çıktıyı değerlendirmesi,
            test etmesi ve arkasındaki mantığı anlaması hâlâ önemli.
          </p>
          <h2>Önemli olan yalnızca kod yazmak değil</h2>
          <p>
            İyi bir yazılım geliştirmek; gereksinimleri anlamayı,
            veri yapıları ve algoritmalar hakkında düşünmeyi,
            sistem tasarlamayı ve farklı çözüm seçeneklerini
            değerlendirmeyi gerektiriyor.
          </p>
          <p>
            Bu nedenle yapay zekâyı bir alternatiften çok,
            doğru kullanıldığında geliştirme sürecini destekleyen
            bir araç olarak değerlendirmek daha anlamlı.
          </p>
          <div className="article-end">
            <span>MEDIA SPACE</span>
            <p>Fikirlerin ve hikâyelerin buluşma noktası.</p>
          </div>
        </div>
      </main>
      <footer className="article-footer">
        <span>© 2026 MEDIA SPACE</span>
        <a href="#">Ana sayfaya dön ↑</a>
      </footer>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState(
    window.location.hash
  )

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash)
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  if (currentPage === '#login') {
    return <AuthPage mode="login" />
  }

  if (currentPage === '#register') {
    return <AuthPage mode="register" />
  }

  if (currentPage === '#article') return <ArticleDetail />

  const today = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="Media Space ana sayfa">
          media space<span>.</span>
        </a>

        <nav className="desktop-nav" aria-label="Kategoriler">
          {categories.map((category) => (
            <a key={category} href="#latest">
              {category}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button className="search-button" aria-label="Ara" title="Ara">
            <SearchIcon />
          </button>
          <a className="login-button" href="#login">
            Giriş yap ↗
          </a>
        </div>
      </header>

      <main>
        <section className="hero" aria-label="Öne çıkan haber">
          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2200&q=90"
            alt="Dünya ve küresel dijital bağlantılar"
          />

          <div className="hero-overlay" />

          <div className="hero-topline">
            <span>BAĞIMSIZ BİR BAKIŞ AÇISI</span>
            <span>{today}</span>
          </div>

          <div className="hero-content">
            <span className="hero-category">DOSYA · TEKNOLOJİ & BİLİM</span>

            <h1>
              Geleceği anlamak
              <br />
              için dünyaya
              <br />
              yeniden bak.
            </h1>

            <p>
              Teknolojiden bilime, dünyayı değiştiren fikirleri
              <br className="desktop-break" />
              ve hikâyeleri keşfet.
            </p>

            <a className="hero-link" href="#latest">
              Hikâyeleri keşfet <ArrowIcon />
            </a>
          </div>

          <div className="hero-counter">
            <span>01</span>
            <span className="counter-line" />
            <span>06</span>
          </div>

          <span className="hero-caption">
            FİKİRLERİN VE HİKÂYELERİN BULUŞMA NOKTASI
          </span>
        </section>

        <section className="trending section-container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">GÜNDEMDE NE VAR?</span>
              <h2>Şimdi gündemde</h2>
            </div>

            <a className="text-link" href="#latest">
              Tüm haberler <ArrowIcon />
            </a>
          </div>

          <div className="trending-grid">
            {trendingArticles.map((article) => (
              <a
                className="trending-card"
                href="#article"
                key={article.number}
              >
                <img src={article.image} alt="" loading="lazy" />

                <span className="trending-number">{article.number}</span>

                <div className="trending-info">
                  <span>{article.category}</span>
                  <h3>{article.title}</h3>
                </div>

                <span className="trending-arrow">
                  <ArrowIcon />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="latest section-container" id="latest">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">MERAK ETTİĞİN HER ŞEY</span>
              <h2>Son hikâyeler</h2>
            </div>

            <div className="latest-date">{today}</div>
          </div>

          <div className="article-grid">
            {articles.map((article, index) => (
              <article className="article-card" key={article.title}>
                <a className="article-image-link" href="#article">
                  <img
                    src={article.image}
                    alt=""
                    loading="lazy"
                    className="article-image"
                  />

                  <span className="article-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </a>

                <div className="article-body">
                  <div className="article-meta">
                    <span className="article-category">
                      {article.category}
                    </span>

                    <button
                      className="bookmark-button"
                      aria-label={`${article.title} haberini kaydet`}
                      title="Kaydet"
                    >
                      <BookmarkIcon />
                    </button>
                  </div>

                  <h3>
                    <a href="#article">{article.title}</a>
                  </h3>

                  <p>{article.description}</p>

                  <div className="article-footer">
                    <span>MEDIA SPACE EDİTÖRÜ</span>
                    <span>{article.time} okuma</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#">
          media space<span>.</span>
        </a>

        <p>Dünyaya farklı bir açıdan bak.</p>

        <span>© 2026 MEDIA SPACE</span>
      </footer>
    </div>
  )
}

export default App