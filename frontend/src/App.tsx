import { useEffect, useState, type SyntheticEvent } from 'react'
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
    id: 'technology-1',
    category: 'TEKNOLOJİ',
    title: 'Yapay zekâ yazılım dünyasını nasıl değiştiriyor?',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=85',
  },
  {
    number: '02',
    id: 'science-1',
    category: 'BİLİM',
    title: 'Bilim dünyasında yeni keşifler',
    image:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=500&q=85',
  },
  {
    number: '03',
    id: 'business-1',
    category: 'İŞ DÜNYASI',
    title: 'Dijital dönüşümün yeni dönemi',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=500&q=85',
  },
]

const articles = [
  {
    id: 'technology-1',
    category: 'TEKNOLOJİ',
    title: 'Yapay zekâ çağında yazılım geliştirmenin değişen yüzü',
    description:
      'Yeni araçlar, değişen alışkanlıklar ve yazılım geliştirmenin geleceği.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85',
    time: '6 dk.',
  },
  {
    id: 'science-1',
    category: 'BİLİM',
    title: 'Evren hakkında bildiklerimizi değiştiren keşifler',
    description:
      'Bilim insanlarının araştırmaları geleceğe dair yeni sorular doğuruyor.',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=85',
    time: '4 dk.',
  },
  {
    id: 'business-1',
    category: 'İŞ DÜNYASI',
    title: 'Geleceğin çalışma hayatı nasıl şekilleniyor?',
    description:
      'Teknoloji, yeni çalışma biçimleri ve değişen iş kültürü.',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85',
    time: '5 dk.',
  },
  {
    id: 'culture-1',
    category: 'KÜLTÜR & SANAT',
    title: 'Şehirlerin hikâyelerini anlatan mekânlar',
    description:
      'Mimari ve kültürel hafıza arasındaki görünmez bağlantılar.',
    image:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85',
    time: '3 dk.',
  },
  {
    id: 'science-2',
    category: 'BİLİM',
    title: 'Okyanusların derinliklerinde keşfedilmeyi bekleyenler',
    description:
      'Dünyamızın henüz tam olarak tanımadığımız ekosistemleri.',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=85',
    time: '7 dk.',
  },
  {
    id: 'news-1',
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
  onLogin: () => void
}

function AuthPage({ mode, onLogin }: AuthPageProps) {
  const isLogin = mode === 'login'

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    const email = String(formData.get('email') ?? '')
      .trim()
      .toLowerCase()

    const password = String(formData.get('password') ?? '')

    const confirmPassword = String(
      formData.get('confirmPassword') ?? ''
    )

    if (!isLogin && password !== confirmPassword) {
      setError('Girdiğin şifreler birbiriyle eşleşmiyor.')
      setIsLoading(false)
      return
    }

    try {
      const endpoint = isLogin
        ? 'http://127.0.0.1:8000/api/auth/login'
        : 'http://127.0.0.1:8000/api/auth/register'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            'Bu e-posta adresiyle daha önce kayıt oluşturulmuş.'
          )
        }

        if (response.status === 401) {
          throw new Error(
            'E-posta adresi veya şifre hatalı.'
          )
        }

        if (response.status === 422) {
          throw new Error(
            'Girdiğin bilgileri kontrol edip tekrar dene.'
          )
        }

        throw new Error(
          data.detail || 'Bir hata oluştu. Lütfen tekrar dene.'
        )
      }

      if (isLogin) {
        localStorage.setItem(
          'mediaSpaceToken',
          data.access_token
        )

        onLogin()
        window.location.hash = ''
      } else {
        setSuccess(
          'Hesabın başarıyla oluşturuldu! Şimdi giriş yapabilirsin.'
        )
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          'Sunucuya bağlanılamadı. Backend sunucusunun çalıştığını kontrol et.'
        )
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Beklenmeyen bir hata oluştu.'
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

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
          onSubmit={handleSubmit}
        >
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
              autoComplete={
                isLogin ? 'current-password' : 'new-password'
              }
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
            <a
              className="forgot-password"
              href="#forgot-password"
            >
              Şifremi unuttum
            </a>
          )}

          {error && (
            <p role="alert" style={{ color: '#c0392b' }}>
              {error}
            </p>
          )}

          {success && (
            <p role="status" style={{ color: '#218838' }}>
              {success}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? 'Lütfen bekle...'
              : isLogin
                ? 'Giriş yap'
                : 'Hesap oluştur'}

            <span aria-hidden="true">↗</span>
          </button>

          <p className="auth-switch">
            {isLogin
              ? 'Henüz hesabın yok mu?'
              : 'Zaten hesabın var mı?'}{' '}

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

const FAVORITES_KEY = 'mediaSpaceFavorites'

function getFavoriteIds(): string[] {
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY)

    return savedFavorites ? JSON.parse(savedFavorites) : []
  } catch {
    return []
  }
}

function toggleFavorite(articleId: string): boolean {
  const favorites = getFavoriteIds()

  const updatedFavorites = favorites.includes(articleId)
    ? favorites.filter((id) => id !== articleId)
    : [...favorites, articleId]

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(updatedFavorites)
  )

  window.dispatchEvent(new Event('favoritesUpdated'))

  return updatedFavorites.includes(articleId)
}

type FavoriteButtonProps = {
  articleId: string
}

function FavoriteButton({ articleId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(() =>
    getFavoriteIds().includes(articleId)
  )

  useEffect(() => {
    const updateFavorite = () => {
      setIsFavorite(getFavoriteIds().includes(articleId))
    }

    window.addEventListener('favoritesUpdated', updateFavorite)

    return () => {
      window.removeEventListener('favoritesUpdated', updateFavorite)
    }
  }, [articleId])

  const handleClick = () => {
    const newFavoriteState = toggleFavorite(articleId)
    setIsFavorite(newFavoriteState)
  }

  return (
    <button
      className={`bookmark-button ${isFavorite ? 'is-favorite' : ''}`}
      aria-label={
        isFavorite
          ? 'Favorilerimden çıkar'
          : 'Favorilerime ekle'
      }
      title={
        isFavorite
          ? 'Favorilerimden çıkar'
          : 'Favorilerime ekle'
      }
      onClick={handleClick}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      </svg>
    </button>
  )
}

function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    () => getFavoriteIds()
  )

  useEffect(() => {
    const updateFavorites = () => {
      setFavoriteIds(getFavoriteIds())
    }

    window.addEventListener('favoritesUpdated', updateFavorites)

    return () => {
      window.removeEventListener('favoritesUpdated', updateFavorites)
    }
  }, [])

  const favoriteArticles = articles.filter((article) =>
    favoriteIds.includes(article.id)
  )

  return (
    <div className="favorites-page">
      <header className="article-header">
        <a className="brand" href="#">
          media space<span>.</span>
        </a>

        <a className="article-back-link" href="#">
          ← Ana sayfaya dön
        </a>
      </header>

      <main className="favorites-main">
        <div className="favorites-heading">
          <span className="section-eyebrow">
            KAYDETTİĞİN HİKÂYELER
          </span>

          <h1>Favorilerim<span></span></h1>

          <p>
            Daha sonra okumak istediğin hikâyeler burada.
          </p>
        </div>

        {favoriteArticles.length === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">♡</div>

            <h2>Henüz favorin yok.</h2>

            <p>
              Beğendiğin haberlerin üzerindeki kalbe tıklayarak
              onları burada saklayabilirsin.
            </p>

            <a className="favorites-home-link" href="#latest">
              Haberleri keşfet ↗
            </a>
          </div>
        ) : (
          <div className="article-grid">
            {favoriteArticles.map((article, index) => (
              <article className="article-card" key={article.id}>
                <a
                  className="article-image-link"
                  href={`#article/${article.id}`}
                >
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

                    <FavoriteButton articleId={article.id} />
                  </div>

                  <h3>
                    <a href={`#article/${article.id}`}>
                      {article.title}
                    </a>
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
        )}
      </main>

      <footer className="article-footer">
        <span>© 2026 MEDIA SPACE</span>
        <a href="#">Ana sayfaya dön ↑</a>
      </footer>
    </div>
  )
}

function ArticleDetail() {
  const articleId = window.location.hash.split('/')[1]

  const article = articles.find(
    (item) => item.id === articleId
  )

  if (!article) {
    return (
      <div className="article-page">
        <main className="article-main">
          <h1>Haber bulunamadı.</h1>
          <a href="#">Ana sayfaya dön</a>
        </main>
      </div>
    )
  }

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
            {article.category}
          </span>

          <h1>{article.title}</h1>

          <p className="article-spot">
            {article.description}
          </p>

          <div className="article-meta">
            <div>
              <span className="article-meta-label">YAZAR</span>
              <span>Media Space Editörleri</span>
            </div>

            <div>
              <span className="article-meta-label">
                YAYIN TARİHİ
              </span>
              <span>17 Ekim 2026</span>
            </div>

            <div>
              <span className="article-meta-label">
                OKUMA SÜRESİ
              </span>
              <span>{article.time}</span>
            </div>
          </div>
        </div>

        <img
          className="article-cover"
          src={article.image}
          alt={article.title}
        />

        <div className="article-content">
          <div className="article-content-top">
            <span className="section-eyebrow">MAKALE</span>

            <FavoriteButton articleId={article.id} />
          </div>

          <p className="article-lead">
            {article.description}
          </p>

          <h2>{article.title}</h2>

          <p>
            {article.description} Bu konudaki gelişmeleri
            anlamak için mevcut bilgileri, yeni araştırmaları
            ve farklı bakış açılarını birlikte değerlendirmek
            gerekiyor.
          </p>

          <p>
            Önümüzdeki dönemde bu alandaki gelişmelerin nasıl
            şekilleneceğini takip etmek, konunun sunduğu
            fırsatları ve beraberinde getirdiği soruları
            daha iyi anlamamıza yardımcı olabilir.
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

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem('mediaSpaceToken'))
  )

  function handleLogout() {
    localStorage.removeItem('mediaSpaceToken')
    setIsLoggedIn(false)
    window.location.hash = ''
  }

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
    return (
      <AuthPage
        mode="login"
        onLogin={() => setIsLoggedIn(true)}
      />
    )
  }

  if (currentPage === '#register') {
    return (
      <AuthPage
        mode="register"
        onLogin={() => setIsLoggedIn(true)}
      />
    )
  }

  if (currentPage === '#favorites') {
    return <FavoritesPage />
  }

  if (currentPage.startsWith('#article/')) {
    return <ArticleDetail />
  }

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
          <a className="favorites-nav-link" href="#favorites">
            Favorilerim
          </a>

          <button
            className="search-button"
            aria-label="Ara"
            title="Ara"
          >
            <SearchIcon />
          </button>

          {isLoggedIn ? (
            <button
              className="login-button"
              onClick={handleLogout}
              type="button"
            >
              Çıkış yap ↗
            </button>
          ) : (
            <a className="login-button" href="#login">
              Giriş yap ↗
            </a>
          )}
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
                href={`#article/${article.id}`}
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
                <a className="article-image-link" href={`#article/${article.id}`}>
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

                    <FavoriteButton articleId={article.id} />
                  </div>

                  <h3>
                    <a href={`#article/${article.id}`}>{article.title}</a>
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