import { useCallback, useEffect, useState, type SyntheticEvent } from 'react'
type ApiArticle = {
  id: number
  title: string
  content: string
  created_at: string
  is_active: boolean
  category: string
  image_url: string | null
  source_url: string | null
}

type UserRole = 'USER' | 'EDITOR' | 'ADMIN'

type AdminUser = {
  id: number
  email: string
  role: UserRole
  created_at: string
}

import './App.css'

const categories = [
  'Gündem',
  'Teknoloji',
  'Bilim',
  'İş Dünyası',
  'Kültür & Sanat',
  'Spor',
]

function SearchIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      <circle cx='10.8' cy='10.8' r='6.5' />
      <path d='m16 16 4.5 4.5' />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true'>
      <path d='M5 12h14M13 5l7 7-7 7' />
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
          'Kayıt tamamlandı. Doğrulama bağlantısı e-posta adresine gönderildi. Gelen kutunu ve spam klasörünü kontrol et.'
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
    <div className='auth-page'>
      <header className='auth-header'>
        <a className='brand' href='#'>
          NewsTrack<span>.</span>
        </a>

        <a className='auth-back-link' href='#'>
          ← Ana sayfaya dön
        </a>
      </header>

      <main className='auth-main'>
        <div className='auth-intro'>
          <span className='section-eyebrow'>
            NEWSTRACK ÜYELİĞİ
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
          className='auth-form'
          onSubmit={handleSubmit}
        >
          <label>
            E-posta adresi
            <input
              type='email'
              name='email'
              placeholder='ornek@email.com'
              autoComplete='email'
              required
            />
          </label>

          <label>
            Şifre
            <input
              type='password'
              name='password'
              placeholder='Şifreni gir'
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
                type='password'
                name='confirmPassword'
                placeholder='Şifreni tekrar gir'
                autoComplete='new-password'
                minLength={8}
                required
              />
            </label>
          )}

          {isLogin && (
            <a
              className='forgot-password'
              href='#forgot-password'
            >
              Şifremi unuttum
            </a>
          )}

          {error && (
            <p role='alert' style={{ color: '#c0392b' }}>
              {error}
            </p>
          )}

          {success && (
            <p role='status' style={{ color: '#218838' }}>
              {success}
            </p>
          )}

          <button
            className='auth-submit'
            type='submit'
            disabled={isLoading}
          >
            {isLoading
              ? 'Lütfen bekle...'
              : isLogin
                ? 'Giriş yap'
                : 'Hesap oluştur'}

            <span aria-hidden='true'>↗</span>
          </button>

          <p className='auth-switch'>
            {isLogin
              ? 'Henüz hesabın yok mu?'
              : 'Zaten hesabın var mı?'}{' '}

            <a href={isLogin ? '#register' : '#login'}>
              {isLogin ? 'Kayıt ol' : 'Giriş yap'}
            </a>
          </p>
        </form>

        <div className='auth-bottom-note'>
          FİKİRLERİN VE HİKÂYELERİN BULUŞMA NOKTASI
        </div>
      </main>

      <footer className='auth-footer'>
        <span>© 2026 NEWSTRACK</span>
        <span>Dünyaya farklı bir açıdan bak.</span>
      </footer>
    </div>
  )
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/auth/forgot-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'İstek gönderilemedi.')
      }

      setMessage(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='auth-page'>
      <header className='auth-header'>
        <a className='brand' href='#'>NewsTrack<span>.</span></a>
        <a className='auth-back-link' href='#login'>← Giriş yap</a>
      </header>

      <main className='auth-main'>
        <div className='auth-intro'>
          <span className='section-eyebrow'>HESAP GÜVENLİĞİ</span>
          <h1>Şifreni yenile.</h1>
          <p>Sıfırlama bağlantısını göndermemiz için hesap e-postanı gir.</p>
        </div>

        <form className='auth-form' onSubmit={handleSubmit}>
          <label>
            E-posta adresi
            <input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete='email'
              required
            />
          </label>

          {message && <p role='status'>{message}</p>}
          {error && <p role='alert'>{error}</p>}

          <button className='auth-submit' type='submit' disabled={isLoading}>
            {isLoading ? 'Gönderiliyor...' : 'Sıfırlama bağlantısı gönder'}
          </button>
        </form>
      </main>
    </div>
  )
}

function ResetPasswordPage({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!token) {
      setError('Sıfırlama bağlantısı eksik veya geçersiz.')
      return
    }

    if (password !== confirmPassword) {
      setError('Girdiğin şifreler eşleşmiyor.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/auth/reset-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            new_password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Şifre güncellenemedi.')
      }

      setMessage('Şifren güncellendi. Artık giriş yapabilirsin.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='auth-page'>
      <header className='auth-header'>
        <a className='brand' href='#'>NewsTrack<span>.</span></a>
        <a className='auth-back-link' href='#login'>← Giriş yap</a>
      </header>

      <main className='auth-main'>
        <div className='auth-intro'>
          <span className='section-eyebrow'>HESAP GÜVENLİĞİ</span>
          <h1>Yeni şifreni belirle.</h1>
        </div>

        <form className='auth-form' onSubmit={handleSubmit}>
          <label>
            Yeni şifre
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete='new-password'
              minLength={8}
              required
            />
          </label>

          <label>
            Yeni şifre tekrarı
            <input
              type='password'
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete='new-password'
              minLength={8}
              required
            />
          </label>

          {message && <p role='status'>{message}</p>}
          {error && <p role='alert'>{error}</p>}

          {message ? (
            <a className='text-link' href='#login'>Giriş yap ↗</a>
          ) : (
            <button
              className='auth-submit'
              type='submit'
              disabled={isLoading || !token}
            >
              {isLoading ? 'Kaydediliyor...' : 'Yeni şifreyi kaydet'}
            </button>
          )}
        </form>
      </main>
    </div>
  )
}

const FAVORITES_KEY = 'mediaSpaceFavorites'

function getFavoritesStorageKey(): string {
  const token = localStorage.getItem('mediaSpaceToken')
  const guestKey = `${FAVORITES_KEY}:guest`

  if (!token) return guestKey

  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return guestKey

    const normalized = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=')

    const payload = JSON.parse(atob(normalized)) as { sub?: string }
    const account = payload.sub?.trim().toLocaleLowerCase('en-US')

   if (!account) return guestKey

    const accountKey = `${FAVORITES_KEY}:${account}`
    const oldFavorites = localStorage.getItem(FAVORITES_KEY)

    if (!localStorage.getItem(accountKey) && oldFavorites) {
      localStorage.setItem(accountKey, oldFavorites)
      localStorage.removeItem(FAVORITES_KEY)
    }

    return accountKey
  } catch {
    return guestKey
  }
}

function getFavoriteIds(storageKey = getFavoritesStorageKey()): string[] {
  try {
    const savedFavorites = localStorage.getItem(storageKey)
    return savedFavorites ? JSON.parse(savedFavorites) : []
  } catch {
    return []
  }
}

function toggleFavorite(
  articleId: string,
  storageKey = getFavoritesStorageKey()
): boolean {
  const favorites = getFavoriteIds(storageKey)

  const updatedFavorites = favorites.includes(articleId)
    ? favorites.filter((id) => id !== articleId)
    : [...favorites, articleId]

  localStorage.setItem(storageKey, JSON.stringify(updatedFavorites))
  window.dispatchEvent(new Event('favoritesUpdated'))

  return updatedFavorites.includes(articleId)
}

type FavoriteButtonProps = {
  articleId: string
}

function FavoriteButton({ articleId }: FavoriteButtonProps) {
  const storageKey = getFavoritesStorageKey()

  const [isFavorite, setIsFavorite] = useState(() =>
    getFavoriteIds(storageKey).includes(articleId)
  )

  useEffect(() => {
    const updateFavorite = () => {
      setIsFavorite(getFavoriteIds(storageKey).includes(articleId))
    }

    window.addEventListener('favoritesUpdated', updateFavorite)

    return () => {
      window.removeEventListener('favoritesUpdated', updateFavorite)
    }
  }, [articleId, storageKey])

  const handleClick = () => {
    if (!isFavorite && !localStorage.getItem('mediaSpaceToken')) {
      window.alert('Favorilere eklemek için önce giriş yapmalısın.')
      window.location.hash = '#login'
      return
    }

    const newFavoriteState = toggleFavorite(articleId, storageKey)
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
      type='button'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='19'
        height='19'
        viewBox='0 0 24 24'
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
      >
        <path d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z' />
      </svg>
    </button>
  )
}

function FavoritesPage() {
  const favoritesStorageKey = getFavoritesStorageKey()
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    () => getFavoriteIds()
  )
  const [allArticles, setAllArticles] = useState<ApiArticle[]>([])
  const [isLoadingAllArticles, setIsLoadingAllArticles] = useState(true)
  const [articlesLoadError, setArticlesLoadError] = useState('')

  useEffect(() => {
    const updateFavorites = () => {
      setFavoriteIds(getFavoriteIds(favoritesStorageKey))
    }

    window.addEventListener('favoritesUpdated', updateFavorites)

    return () => {
      window.removeEventListener('favoritesUpdated', updateFavorites)
    }
  }, [favoritesStorageKey])

  useEffect(() => {
    let isCancelled = false

    async function fetchAllArticles() {
      const token = localStorage.getItem('mediaSpaceToken')
      const loadedArticles: ApiArticle[] = []
      const pageSize = 100
      let offset = 0

      try {
        while (true) {
          const response = await fetch(
            `http://127.0.0.1:8000/api/articles?limit=${pageSize}&offset=${offset}`,
            {
              headers: token
                ? { Authorization: `Bearer ${token}` }
                : {},
            }
          )

          if (!response.ok) {
            throw new Error('Haberler alınamadı.')
          }

          const batch: ApiArticle[] = await response.json()
          loadedArticles.push(...batch)

          if (batch.length < pageSize) {
            break
          }

          offset += pageSize
        }

        if (!isCancelled) {
          setAllArticles(loadedArticles)
        }
      } catch (error) {
        if (!isCancelled) {
          setArticlesLoadError(
            error instanceof Error ? error.message : 'Haberler alınamadı.'
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAllArticles(false)
        }
      }
    }

    fetchAllArticles()

    return () => {
      isCancelled = true
    }
  }, [])

  const favoriteArticles = allArticles.filter((article) =>
    favoriteIds.includes(String(article.id))
  )

  return (
    <div className='favorites-page'>
      <header className='article-header'>
        <a className='brand' href='#'>
          NewsTrack<span>.</span>
        </a>

        <a className='article-back-link' href='#'>
          ← Ana sayfaya dön
        </a>
      </header>

      <main className='favorites-main'>
        <div className='favorites-heading'>
          <span className='section-eyebrow'>
            KAYDETTİĞİN HİKÂYELER
          </span>

          <h1>Favorilerim<span></span></h1>

          <p>
            Daha sonra okumak istediğin hikâyeler burada.
          </p>
        </div>

        {isLoadingAllArticles ? (
          <p className='articles-message'>Favoriler yükleniyor...</p>
        ) : articlesLoadError ? (
          <p className='articles-message' role='alert'>
            {articlesLoadError}
          </p>
        ) : favoriteArticles.length === 0 ? (

          <div className='favorites-empty'>
            <div className='favorites-empty-icon'>♡</div>

            <h2>Henüz favorin yok.</h2>

            <p>
              Beğendiğin haberlerin üzerindeki kalbe tıklayarak
              onları burada saklayabilirsin.
            </p>

            <a className='favorites-home-link' href='#latest'>
              Haberleri keşfet ↗
            </a>
          </div>
        ) : (
          <div className='article-grid'>
            {favoriteArticles.map((article, index) => (
              <article className='article-card' key={article.id}>
                <a
                  className='article-image-link'
                  href={`#article/${article.id}`}
                >
                  <img
                    src={
                    article.image_url ||
                    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=85'
                    }
                    alt={article.title}
                    loading='lazy'
                    className='article-image'
                  />

                  <span className='article-index'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </a>

                <div className='article-body'>
                  <div className='article-meta'>
                    <span className='article-category'>
                      {article.category}
                    </span>

                    <FavoriteButton articleId={String(article.id)} />
                  </div>

                  <h3>
                    <a href={`#article/${article.id}`}>
                      {article.title}
                    </a>
                  </h3>

                  <p>
                    {article.content.length > 150
                      ? `${article.content.slice(0, 150)}...`
                      : article.content}
                  </p>

                  <div className='article-footer'>
                    <span>NEWSTRACK EDİTÖRÜ</span>
                    <span>
                      {Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200))} dk okuma
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className='article-footer'>
        <span>© 2026 NEWSTRACK</span>
        <a href='#'>Ana sayfaya dön ↑</a>
      </footer>
    </div>
  )
}

function ArticleDetail({
  apiArticles,
  suggestionArticles,
}: {
  apiArticles: ApiArticle[]
  suggestionArticles: ApiArticle[]
}) {
    const articleId = window.location.hash.split('/')[1]

    const articleFromCurrentLists = [...apiArticles, ...suggestionArticles].find(
    (item) => String(item.id) === articleId
  )

  const [fetchedArticle, setFetchedArticle] = useState<ApiArticle | null>(null)
  const [isLoadingArticle, setIsLoadingArticle] = useState(true)

  useEffect(() => {
    let isCancelled = false

    if (articleFromCurrentLists) {
      setFetchedArticle(articleFromCurrentLists)
      setIsLoadingArticle(false)
      return
    }

    setIsLoadingArticle(true)

    async function fetchArticle() {
      const token = localStorage.getItem('mediaSpaceToken')

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/articles/${articleId}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        )

        if (!response.ok) {
          throw new Error('Haber bulunamadı.')
        }

        const data: ApiArticle = await response.json()

        if (!isCancelled) {
          setFetchedArticle(data)
        }
      } catch {
        if (!isCancelled) {
          setFetchedArticle(null)
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingArticle(false)
        }
      }
    }

    fetchArticle()

    return () => {
      isCancelled = true
    }
  }, [articleId, apiArticles, suggestionArticles])

  const article =
    articleFromCurrentLists ??
    (fetchedArticle && String(fetchedArticle.id) === articleId
      ? fetchedArticle
      : null)

  if (!article) {
    return (
      <div className='article-page'>
        <main className='article-main'>
          <h1>{isLoadingArticle ? 'Haber yükleniyor...' : 'Haber bulunamadı.'}</h1>
          <a href='#'>Ana sayfaya dön</a>
        </main>
      </div>
    )
  }

  return (
    <div className='article-page'>
      <header className='article-header'>
        <a className='brand' href='#'>
          NewsTrack<span>.</span>
        </a>

        <a className='article-back-link' href='#'>
          ← Ana sayfaya dön
        </a>
      </header>

      <main className='article-main'>
        <div className='article-heading'>
          <span className='section-eyebrow'>
            {article.category}
          </span>

          <h1>{article.title}</h1>

          <p className='article-spot'>
            {article.content}
          </p>


          <div className='article-meta'>
            <div>
              <span className='article-meta-label'>YAZAR</span>
              <span>NewsTrack Editörleri</span>
            </div>

            <div>
              <span className='article-meta-label'>
                YAYIN TARİHİ
              </span>
              <span>
                {new Intl.DateTimeFormat('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(article.created_at))}
              </span>

            </div>

            <div>
              <span className='article-meta-label'>
                OKUMA SÜRESİ
              </span>
              <span>{Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200))} dk</span>
            </div>
          </div>
        </div>

        <img
          className='article-cover'
          src={
            article.image_url ||
            'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=85'
          }
          alt={article.title}
        />

        <div className='article-content'>
          <div className='article-content-top'>
            <span className='section-eyebrow'>MAKALE</span>

            <FavoriteButton articleId={String(article.id)} />
          </div>

          <p className='article-lead'>
            {article.content}
          </p>

          <h2>{article.title}</h2>

          {article.source_url && (
            <div>
              <p>
                Bu sayfada haberin kısa özeti yer alıyor. Haberin tüm ayrıntıları için kaynağı ziyaret edebilirsin.
              </p>

              <a
                className='text-link'
                href={article.source_url}
                target='_blank'
                rel='noopener noreferrer'
              >
                Kaynağında haberin tamamını oku ↗
              </a>
            </div>
          )}

          <div className='article-end'>
            <span>NEWSTRACK</span>
            <p>Fikirlerin ve hikâyelerin buluşma noktası.</p>
          </div>
        </div>
      </main>

      <footer className='article-footer'>
        <span>© 2026 NEWSTRACK</span>
        <a href='#'>Ana sayfaya dön ↑</a>
      </footer>
    </div>
  )
}

function AccountPage({ onDeleted }: { onDeleted: () => void }) {
  const [profile, setProfile] = useState<{
    email: string
    role: UserRole
  } | null>(null)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadProfile() {
      const token = localStorage.getItem('mediaSpaceToken')

      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        })

        if (!response.ok) {
          throw new Error('Hesap bilgileri alınamadı.')
        }

        const data: { email: string; role: UserRole } =
          await response.json()

        if (!isCancelled) {
          setProfile(data)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isCancelled = true
    }
  }, [])

  async function handleDeleteAccount() {
    if (!password) {
      setError('Hesabını silmek için mevcut şifreni gir.')
      return
    }

    const confirmed = window.confirm(
      'Hesabın kalıcı olarak silinecek. Devam etmek istiyor musun?'
    )

    if (!confirmed) return

    const token = localStorage.getItem('mediaSpaceToken')
    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.detail || 'Hesap silinemedi.')
      }

      localStorage.removeItem(getFavoritesStorageKey())
      window.dispatchEvent(new Event('favoritesUpdated'))
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setIsDeleting(false)
    }
  }

  const roleLabel =
    profile?.role === 'ADMIN'
      ? 'Admin'
      : profile?.role === 'EDITOR'
        ? 'Editör'
        : 'Kullanıcı'

  return (
    <div className='app-shell'>
      <header className='site-header'>
        <a className='brand' href='#'>
          NewsTrack<span>.</span>
        </a>
        <a className='login-button' href='#'>
          Ana sayfa
        </a>
      </header>

      <main className='section-container dashboard-main'>
        <span className='section-eyebrow'>HESAP AYARLARI</span>
        <h1>Hesabım</h1>

        {isLoading ? (
          <p>Hesap bilgileri yükleniyor...</p>
        ) : profile ? (
          <div className='auth-form dashboard-form'>
            <p>
              <strong>E-posta:</strong> {profile.email}
            </p>
            <p>
              <strong>Rol:</strong> {roleLabel}
            </p>

            <hr />

            <h2>Hesabını sil</h2>
            <p>
              Bu işlem geri alınamaz. Devam etmek için mevcut şifreni gir.
            </p>

            <label>
              Mevcut şifren
              <input
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete='current-password'
              />
            </label>

            {error && <p role='alert'>{error}</p>}

            <button
              className='dashboard-secondary-button'
              type='button'
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Hesap siliniyor...' : 'Hesabımı kalıcı olarak sil'}
            </button>
          </div>
        ) : (
          error && <p role='alert'>{error}</p>
        )}
      </main>
    </div>
  )
}

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedRoles, setSelectedRoles] = useState<Record<number, UserRole>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadUsers = useCallback(async () => {
    const token = localStorage.getItem('mediaSpaceToken')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/users', {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      })

      if (!response.ok) {
        throw new Error('Kullanıcı listesi alınamadı.')
      }

      const data: AdminUser[] = await response.json()
      setUsers(data)

      const rolesByUserId: Record<number, UserRole> = {}
      data.forEach((user) => {
        rolesByUserId[user.id] = user.role
      })
      setSelectedRoles(rolesByUserId)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  async function saveRole(user: AdminUser) {
    const newRole = selectedRoles[user.id] ?? user.role

    if (newRole === user.role) {
      return
    }

    if (!window.confirm(`${user.email} hesabının rolünü ${newRole} yapmak istiyor musun?`)) {
      return
    }

    const token = localStorage.getItem('mediaSpaceToken')
    setSavingUserId(user.id)
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/users/${user.id}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ role: newRole }),
        }
      )

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.detail || 'Rol değiştirilemedi.')
      }

      setMessage('Kullanıcı rolü güncellendi.')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setSavingUserId(null)
    }
  }

  async function deleteUser(user: AdminUser) {
    const confirmed = window.confirm(
      `${user.email} hesabını silmek istiyor musun? Bu işlem geri alınamaz.`
    )

    if (!confirmed) return

    const token = localStorage.getItem('mediaSpaceToken')
    setDeletingUserId(user.id)
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/admin/users/${user.id}`,
        {
          method: 'DELETE',
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      )

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.detail || 'Kullanıcı silinemedi.')
      }

      setMessage(`${user.email} hesabı silindi.`)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setDeletingUserId(null)
    }
  }

  return (
    <div className='app-shell'>
      <header className='site-header'>
        <a className='brand' href='#'>
          NewsTrack<span>.</span>
        </a>
        <span>Admin · Kullanıcı Yönetimi</span>
        <a className='login-button' href='#dashboard'>Haber Yönetimi</a>
      </header>

      <main className='section-container dashboard-main'>
        <div className='section-header'>
          <div>
            <span className='section-eyebrow'>HESAP VE ROLLER</span>
            <h1>Kullanıcı Yönetimi</h1>
          </div>
        </div>

        {message && <p role='status'>{message}</p>}
        {error && <p role='alert'>{error}</p>}

        {isLoading ? (
          <p>Kullanıcılar yükleniyor...</p>
        ) : (
          <div className='dashboard-article-list'>
            {users.map((user) => (
              <article className='dashboard-article' key={user.id}>
                <div>
                  <strong>{user.email}</strong>
                  <p>
                    Kayıt tarihi:{' '}
                    {new Intl.DateTimeFormat('tr-TR').format(
                      new Date(user.created_at)
                    )}
                  </p>
                </div>

                <div className='dashboard-article-actions'>
                  <select
                    value={selectedRoles[user.id] ?? user.role}
                    onChange={(event) =>
                      setSelectedRoles({
                        ...selectedRoles,
                        [user.id]: event.target.value as UserRole,
                      })
                    }
                    aria-label={`${user.email} rolü`}
                  >
                    <option value='USER'>Kullanıcı</option>
                    <option value='EDITOR'>Editör</option>
                    <option value='ADMIN'>Admin</option>
                  </select>

                    <button
                    type='button'
                    onClick={() => saveRole(user)}
                    disabled={savingUserId === user.id}
                  >
                    {savingUserId === user.id ? 'Kaydediliyor...' : 'Rolü kaydet'}
                  </button>

                  <button
                    type='button'
                    onClick={() => deleteUser(user)}
                    disabled={deletingUserId === user.id}
                  >
                    {deletingUserId === user.id ? 'Siliniyor...' : 'Sil'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

type EditorialDashboardProps = {
  userRole: 'EDITOR' | 'ADMIN'
}

function EditorialDashboard({ userRole }: EditorialDashboardProps) {
  const [articles, setArticles] = useState<ApiArticle[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadArticles = useCallback(async () => {
    const token = localStorage.getItem('mediaSpaceToken')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/articles?limit=100&offset=0',
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      )

      if (!response.ok) {
        throw new Error('Haber listesi alınamadı.')
      }

      const data: ApiArticle[] = await response.json()
      setArticles(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  function resetForm() {
    setTitle('')
    setContent('')
    setEditingArticleId(null)
    setImageUrl('')
  }

  async function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')
    setError('')

    const token = localStorage.getItem('mediaSpaceToken')
    const isEditing = editingArticleId !== null

    try {
      const response = await fetch(
        isEditing
          ? `http://127.0.0.1:8000/api/articles/${editingArticleId}`
          : 'http://127.0.0.1:8000/api/articles',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title,
            content,
            image_url: imageUrl.trim() || null,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Haber kaydedilemedi. Yetkini kontrol et.')
      }

      setMessage(isEditing ? 'Haber güncellendi.' : 'Haber eklendi.')
      resetForm()
      await loadArticles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(article: ApiArticle) {
    const token = localStorage.getItem('mediaSpaceToken')
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/articles/${article.id}/status?is_active=${!article.is_active}`,
        {
          method: 'PATCH',
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      )

      if (!response.ok) {
        throw new Error('Haberin yayın durumu değiştirilemedi.')
      }

      setMessage(article.is_active ? 'Haber yayından kaldırıldı.' : 'Haber yayımlandı.')
      await loadArticles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    }
  }

  async function handleDelete(article: ApiArticle) {
    if (!window.confirm(`“${article.title}” haberini kalıcı olarak silmek istiyor musun?`)) {
      return
    }

    const token = localStorage.getItem('mediaSpaceToken')
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/articles/${article.id}`,
        {
          method: 'DELETE',
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      )

      if (!response.ok) {
        throw new Error('Haber silinemedi. Bu işlem yalnızca admin içindir.')
      }

      setMessage('Haber silindi.')
      await loadArticles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    }
  }

  async function handleRssImport() {
    const token = localStorage.getItem('mediaSpaceToken')
    setError('')
    setMessage('RSS haberleri içe aktarılıyor...')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/rss/import', {
        method: 'POST',
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      })

      if (!response.ok) {
        throw new Error('RSS aktarımı başarısız. Yetkini kontrol et.')
      }

      const result = await response.json()
      setMessage(`RSS aktarımı tamamlandı. Eklenen haber: ${result.added}`)
      await loadArticles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
    }
  }

  return (
    <div className='app-shell'>
      <header className='site-header'>
        <a className='brand' href='#'>
          NewsTrack<span>.</span>
        </a>
        <span>{userRole === 'ADMIN' ? 'Admin Paneli' : 'Editör Paneli'}</span>
        <a className='login-button' href='#'>Ana sayfa</a>
        {userRole === 'ADMIN' && (
          <a className="login-button" href="#admin/users">
            Kullanıcı Yönetimi
          </a>
        )}
      </header>

      <main className='section-container dashboard-main'>
        <div className='section-header'>
          <div>
            <span className='section-eyebrow'>HABER YÖNETİMİ</span>
            <h1>{editingArticleId ? 'Haberi düzenle' : 'Yeni haber ekle'}</h1>
          </div>
          <button className='text-link' type='button' onClick={handleRssImport}>
            RSS haberlerini içe aktar
          </button>
        </div>

        <form className='auth-form dashboard-form' onSubmit={handleSave}>
          <label>
            Haber başlığı
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label>
            Haber içeriği
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={8}
              required
            />
          </label>

          <label>
            Resim URL’si (isteğe bağlı)
            <input
              type='url'
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder='https://ornek.com/resim.jpg'
            />
          </label>
          <p>Manuel eklenen haberler varsayılan olarak Gündem kategorisine kaydedilir.</p>

          <button className='auth-submit' type='submit' disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : editingArticleId ? 'Değişiklikleri kaydet' : 'Haberi ekle'}
          </button>

          {editingArticleId !== null && (
            <button className='dashboard-secondary-button' type='button' onClick={resetForm}>
              Düzenlemeyi iptal et
            </button>
          )}
        </form>

        {message && <p role='status'>{message}</p>}
        {error && <p role='alert'>{error}</p>}

        <h2>Haberler</h2>

        {isLoading ? (
          <p>Haberler yükleniyor...</p>
        ) : (
          <div className='dashboard-article-list'>
            {articles.map((article) => (
              <article className='dashboard-article' key={article.id}>
                <div>
                  <strong>{article.title}</strong>
                  <p>{article.category} · {article.is_active ? 'Yayında' : 'Yayında değil'}</p>
                </div>

                <div className='dashboard-article-actions'>
                  {!article.source_url && (
                    <button
                      type='button'
                      onClick={() => {
                        setEditingArticleId(article.id)
                        setTitle(article.title)
                        setContent(article.content)
                        setImageUrl(article.image_url ?? '')
                      }}
                    >
                      Düzenle
                    </button>
                  )}

                  <button type='button' onClick={() => handleStatusChange(article)}>
                    {article.is_active ? 'Yayından kaldır' : 'Yayımla'}
                  </button>

                  {userRole === 'ADMIN' && (
                    <button type='button' onClick={() => handleDelete(article)}>
                      Sil
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
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

  const [userRole, setUserRole] = useState<'USER' | 'EDITOR' | 'ADMIN' | null>(null)
  const [apiArticles, setApiArticles] = useState<ApiArticle[]>([])
  const [suggestionArticles, setSuggestionArticles] = useState<ApiArticle[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [articlePage, setArticlePage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const pageSize = 9
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)
  const [articlesError, setArticlesError] = useState('')

  useEffect(() => {
    if (!isLoggedIn) {
      setUserRole(null)
      return
    }

    let isCancelled = false

    async function fetchUserRole() {
      const token = localStorage.getItem('mediaSpaceToken')

      if (!token) {
        setUserRole(null)
        return
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Kullanıcı rolü alınamadı.')
        }

        const user: { role: 'USER' | 'EDITOR' | 'ADMIN' } =
          await response.json()

        if (!isCancelled) {
          setUserRole(user.role)
        }
      } catch {
        if (!isCancelled) {
          setUserRole(null)
        }
      }
    }

    fetchUserRole()

    return () => {
      isCancelled = true
    }
  }, [isLoggedIn])

  useEffect(() => {
  const token = localStorage.getItem('mediaSpaceToken')

    let isCancelled = false

    async function fetchArticles() {
      setIsLoadingArticles(true)
      setArticlesError('')

      try {
      setIsLoadingArticles(true)
      setArticlesError('')

      const params = new URLSearchParams()

      if (submittedSearch.trim()) {
        params.set('search', submittedSearch.trim())
      }

      if (selectedCategory) {
        params.set('category', selectedCategory)
      }
      params.set('limit', String(pageSize + 1))
      params.set('offset', String(articlePage * pageSize))

      const response = await fetch(
       `http://127.0.0.1:8000/api/articles?${params.toString()}`,       {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      )

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error(
              'Haberleri görmek için tekrar giriş yapman gerekebilir.'
            )
          }

          throw new Error('Haberler alınamadı.')
        }

        const data: ApiArticle[] = await response.json()

        if (!isCancelled) {
          setHasNextPage(data.length > pageSize)
          setApiArticles(data.slice(0, pageSize))
        }
      } catch (error) {
        if (!isCancelled) {
          setArticlesError(
            error instanceof Error
              ? error.message
              : 'Beklenmeyen bir hata oluştu.'
          )
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingArticles(false)
        }
      }
    }

    fetchArticles()

    return () => {
      isCancelled = true
    }
  }, [isLoggedIn, submittedSearch, selectedCategory, articlePage])
  useEffect(() => {
    const query = searchTerm.trim()

    if (!isSearchOpen || query.length < 2) {
      setSuggestionArticles([])
      return
    }

    let isCancelled = false

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/articles?search=${encodeURIComponent(query)}&limit=5`
        )

        if (!response.ok) {
          throw new Error('Öneriler alınamadı.')
        }

        const data: ApiArticle[] = await response.json()

        if (!isCancelled) {
          setSuggestionArticles(data.filter((article) => article.is_active))
        }
      } catch {
        if (!isCancelled) {
          setSuggestionArticles([])
        }
      }
    }, 300)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [searchTerm, isSearchOpen])


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
        mode='login'
        onLogin={() => setIsLoggedIn(true)}
      />
    )
  }

  if (currentPage === '#register') {
    return (
      <AuthPage
        mode='register'
        onLogin={() => setIsLoggedIn(true)}
      />
    )
  }

  if (currentPage === '#forgot-password') {
    return <ForgotPasswordPage />
  }

  if (currentPage.startsWith('#reset-password')) {
    const queryString = currentPage.split('?')[1] ?? ''
    const token = new URLSearchParams(queryString).get('token') ?? ''
    return <ResetPasswordPage token={token} />
  }

  if (currentPage === '#account') {
    if (!isLoggedIn) {
      return (
        <AuthPage
          mode='login'
          onLogin={() => setIsLoggedIn(true)}
        />
      )
    }

    return <AccountPage onDeleted={handleLogout} />
  }

  if (currentPage === '#admin/users') {
    if (!isLoggedIn) {
      return (
        <AuthPage
          mode='login'
          onLogin={() => setIsLoggedIn(true)}
        />
      )
    }
    if (userRole !== 'ADMIN') {
      return <main className="dashboard-main">Bu sayfayı yalnızca adminler görüntüleyebilir.</main>
    }
    return <AdminUsersPage />
  }

  if (currentPage === '#dashboard') {
    if (!isLoggedIn) {
      return (
        <AuthPage
          mode='login'
          onLogin={() => setIsLoggedIn(true)}
        />
      )
    }

    if (userRole === 'EDITOR' || userRole === 'ADMIN') {
      return <EditorialDashboard userRole={userRole} />
    }

    return (
      <div className='app-shell'>
        <main className='section-container dashboard-main'>
          <h1>Bu sayfa için editör veya admin yetkisi gerekiyor.</h1>
          <a href='#'>Ana sayfaya dön</a>
        </main>
      </div>
    )
  }

  if (currentPage === '#favorites') {
    return <FavoritesPage />
  }

  if (currentPage.startsWith('#article/')) {
    return (
      <ArticleDetail
        apiArticles={apiArticles}
        suggestionArticles={suggestionArticles}
      />
    )
  }

  const today = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className='app-shell'>
      <header className='site-header'>
        <a className='brand' href='#' aria-label='NewsTrack ana sayfa'>
          NewsTrack<span>.</span>
        </a>

        <nav className='desktop-nav' aria-label='Kategoriler'>
          <a
            href='#latest'
            onClick={() => {
              setSelectedCategory('')
              setArticlePage(0)
            }}
          >
            Tümü
          </a>
          {categories.map((category) => (
            <a
              key={category}
              href='#latest'
              onClick={() => {
                setSelectedCategory(category)
                setArticlePage(0)
              }} 
            >
              {category}
            </a>
          ))}
        </nav>

  

        <div className='header-actions'>
          
          {(userRole === 'EDITOR' || userRole === 'ADMIN') && (
            <a className='favorites-nav-link' href='#dashboard'>
              Yönetim Paneli
            </a>
          )}

          {isLoggedIn && (
            <a className='favorites-nav-link' href='#account'>
              Hesabım
            </a>
          )}
            
          <a className='favorites-nav-link' href='#favorites'>
            Favorilerim
          </a>

          <button
            className='search-button'
            aria-label='Ara'
            title='Ara'
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <SearchIcon />
          </button>

          {isSearchOpen && (
            <div className='search-container'>
              <input
                className='search-input'
                type='search'
                placeholder='Haberlerde ara...'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setSubmittedSearch(searchTerm.trim())
                    setArticlePage(0)
                  }
                }}
                autoFocus
              />

              {searchTerm.trim().length >= 2 && (
                <div className='search-suggestions'>
                  {suggestionArticles
                    .filter(
                      (article) =>
                        article.is_active &&
                        (article.title.toLocaleLowerCase('tr-TR').includes(searchTerm.trim().toLocaleLowerCase('tr-TR')) ||
                          article.content.toLocaleLowerCase('tr-TR').includes(searchTerm.trim().toLocaleLowerCase('tr-TR')))
                    )
                    .slice(0, 5)
                    .map((article) => (
                      <a
                        key={article.id}
                        href={`#article/${article.id}`}
                        className='search-suggestion'
                      >
                        <span>{article.category}</span>
                        <strong>{article.title}</strong>
                      </a>
                    ))}
                </div>
              )}
          </div>
        )}

          {isLoggedIn ? (
            <button
              className='login-button'
              onClick={handleLogout}
              type='button'
            >
              Çıkış yap ↗
            </button>
          ) : (
            <a className='login-button' href='#login'>
              Giriş yap ↗
            </a>
          )}
        </div>
      </header>

      <main>
        <section className='hero' aria-label='Öne çıkan haber'>
          <img
            className='hero-image'
            src='https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2200&q=90'
            alt='Dünya ve küresel dijital bağlantılar'
          />

          <div className='hero-overlay' />

          <div className='hero-topline'>
            <span>BAĞIMSIZ BİR BAKIŞ AÇISI</span>
            <span>{today}</span>
          </div>

          <div className='hero-content'>
            <span className='hero-category'>DOSYA · TEKNOLOJİ & BİLİM</span>

            <h1>
              Geleceği anlamak
              <br />
              için dünyaya
              <br />
              yeniden bak.
            </h1>

            <p>
              Teknolojiden bilime, dünyayı değiştiren fikirleri
              <br className='desktop-break' />
              ve hikâyeleri keşfet.
            </p>

            <a className='hero-link' href='#latest'>
              Hikâyeleri keşfet <ArrowIcon />
            </a>
          </div>

          <div className='hero-counter'>
            <span>01</span>
            <span className='counter-line' />
            <span>06</span>
          </div>

          <span className='hero-caption'>
            FİKİRLERİN VE HİKÂYELERİN BULUŞMA NOKTASI
          </span>
        </section>

        <section className='trending section-container'>
          <div className='section-header'>
            <div>
              <span className='section-eyebrow'>GÜNDEMDE NE VAR?</span>
              <h2>Şimdi gündemde</h2>
            </div>

            <a className='text-link' href='#latest'>
              Tüm haberler <ArrowIcon />
            </a>
          </div>

          <div className='trending-grid'>
            {apiArticles.filter((article) => article.is_active).map((article, index) => (
              <a
                className='trending-card'
                href={`#article/${article.id}`}
                key={article.id}
              >
                <img
                  src={
                    article.image_url ||
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=85'
                  }
                  alt={article.title}
                  loading='lazy'
                />

                <span className='trending-number'>
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className='trending-info'>
                  <span>{article.category}</span>
                  <h3>{article.title}</h3>
                </div>

                <span className='trending-arrow'>
                  <ArrowIcon />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className='latest section-container' id='latest'>
          <div className='section-header'>
            <div>
              <span className='section-eyebrow'>MERAK ETTİĞİN HER ŞEY</span>
              <h2>Son hikâyeler</h2>
            </div>

            <div className='latest-date'>{today}</div>
          </div>

          {isLoadingArticles ? (
            <p className='articles-message'>Haberler yükleniyor...</p>
          ) : articlesError ? (
            <p className='articles-message' role='alert'>
              {articlesError}
            </p>
          ) : apiArticles.length === 0 ? (
            <p className='articles-message'>
              Henüz gösterilecek haber bulunmuyor.
            </p>
          ) : (
            <div className='article-grid'>
              {apiArticles.filter((article) => article.is_active).map((article, index) => (
                <article className='article-card' key={article.id}>
                  <a
                    className='article-image-link'
                    href={`#article/${article.id}`}
                  >
                    <img
                      src={
                        article.image_url ||
                        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=85'
                      }
                      alt={article.title}
                      loading='lazy'
                      className='article-image'
                    />
                <span className='article-index'>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </a>
              <div className='article-body'>
                <div className='article-meta'>
                  <span className='article-category'>
                    {article.category.toLocaleUpperCase('tr-TR')}
                  </span>
                  <FavoriteButton articleId={String(article.id)} />
                </div>
                <h3>
                  <a href={`#article/${article.id}`}>
                    {article.title}
                  </a>
                </h3>
                <p>
                  {article.content.length > 150
                    ? `${article.content.slice(0, 150)}...`
                    : article.content}
                </p>
                <div className='article-footer'>
                  <span>NEWSTRACK EDİTÖRÜ</span>
                  <span>
                    {new Intl.DateTimeFormat('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(article.created_at))}
                  </span>
                </div>
              </div>
            </article>
          ))}
            </div>
          )}

          {!isLoadingArticles && !articlesError && apiArticles.length > 0 && (
            <nav className='pagination' aria-label='Haber sayfaları'>
              <button
                type='button'
                onClick={() => setArticlePage((page) => Math.max(0, page - 1))}
                disabled={articlePage === 0}
              >
                Önceki
              </button>

              <span aria-live='polite'>Sayfa {articlePage + 1}</span>

              <button
                type='button'
                onClick={() => setArticlePage((page) => page + 1)}
                disabled={!hasNextPage}
              >
                Sonraki
              </button>
            </nav>
          )}

        </section>
      </main>

      <footer className='site-footer'>
        <a className='footer-brand' href='#'>
          NewsTrack<span>.</span>
        </a>

        <p>Dünyaya farklı bir açıdan bak.</p>

        <span>© 2026 NEWSTRACK</span>
      </footer>
    </div>
  )
}

export default App