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

function App() {
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
          <button className="login-button">Giriş yap ↗</button>
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
                href="#latest"
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
                <a className="article-image-link" href="#latest">
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
                    <a href="#latest">{article.title}</a>
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