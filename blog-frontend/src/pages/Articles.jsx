import { useState, useMemo, useEffect } from 'react';
import api from '../api/axios';
import './Articles.css';
import { Link, useLocation } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

const ARTICLES_PER_PAGE = 6;

const Articles = () => {
  const { pathname } = useLocation();
  const isLecteur = pathname.startsWith('/lecteur');
  const articleBasePath = isLecteur ? '/lecteur/articles' : '/articles';
  const { favorites, toggleFavorite } = useFavorites();
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // ---- Chargement depuis l'API Django ----
  useEffect(() => {
    api.get('/articles/')
      .then((res) => setAllArticles(res.data))
      .catch(() => setError("Impossible de charger les articles."))
      .finally(() => setLoading(false));
  }, []);

  // ---- Catégories dynamiques ----
  const categories = useMemo(() => {
    const unique = [...new Set(allArticles.map((a) => a.category_name).filter(Boolean))];
    return ['Tous', ...unique];
  }, [allArticles]);

  // ---- Filtrage + tri ----
  const filteredArticles = useMemo(() => {
    let result = allArticles;

    if (activeCategory !== 'Tous') {
      result = result.filter((a) => a.category_name === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          (a.title || '').toLowerCase().includes(q) ||
          (a.content || '').toLowerCase().includes(q) ||
          (a.category_name || '').toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      const da = new Date(a.published_at || 0);
      const db = new Date(b.published_at || 0);
      if (sortBy === 'recent') return db - da;
      if (sortBy === 'oldest') return da - db;
      if (sortBy === 'alpha') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return result;
  }, [allArticles, activeCategory, search, sortBy]);

  // ---- Pagination ----
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + ARTICLES_PER_PAGE
  );

  const handleCategoryChange = (cat) => { setActiveCategory(cat); setCurrentPage(1); };
  const handleSearchChange = (e) => { setSearch(e.target.value); setCurrentPage(1); };
  const handleSortChange = (e) => { setSortBy(e.target.value); setCurrentPage(1); };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="articles-page">

      {/* ===== HERO ===== */}
      <section className="articles-hero">
        <span className="articles-badge">✦ Publications officielles</span>
        <h1 className="articles-title">
          Tous les articles<br />
          <span className="articles-accent">de la rédaction</span>
        </h1>
        <p className="articles-subtitle">
          Retrouvez l'ensemble des articles publiés par l'équipe éditoriale
          de Bookfolio. Des réflexions, des sélections et des analyses
          pour nourrir votre passion des livres.
        </p>
      </section>

      {/* ===== BARRE DE RECHERCHE + TRI ===== */}
      <section className="articles-controls">
        <div className="articles-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un article, un thème..."
            value={search}
            onChange={handleSearchChange}
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => { setSearch(''); setCurrentPage(1); }}
              aria-label="Effacer"
            >
              ✕
            </button>
          )}
        </div>

        <select className="articles-sort" value={sortBy} onChange={handleSortChange}>
          <option value="recent">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="alpha">A → Z</option>
        </select>
      </section>

      {/* ===== FILTRES CATÉGORIES ===== */}
      <section className="articles-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
            {cat !== 'Tous' && (
              <span className="filter-count">
                {allArticles.filter((a) => a.category_name === cat).length}
              </span>
            )}
          </button>
        ))}
      </section>

      {/* ===== RÉSULTATS ===== */}
      <section className="articles-results">
        <div className="articles-results-header">
          <p>
            <strong>{filteredArticles.length}</strong>{' '}
            {filteredArticles.length > 1 ? 'articles trouvés' : 'article trouvé'}
            {activeCategory !== 'Tous' && ` dans « ${activeCategory} »`}
            {search && ` pour « ${search} »`}
          </p>
        </div>

        {loading ? (
          <div className="articles-empty">
            <p>Chargement des articles…</p>
          </div>
        ) : error ? (
          <div className="articles-empty">
            <div className="empty-icon">⚠</div>
            <h3>{error}</h3>
          </div>
        ) : paginatedArticles.length === 0 ? (
          <div className="articles-empty">
            <div className="empty-icon">📭</div>
            <h3>Aucun article trouvé</h3>
            <p>Essayez de modifier votre recherche ou vos filtres.</p>
            <button
              className="btn-reset"
              onClick={() => {
                setSearch('');
                setActiveCategory('Tous');
                setSortBy('recent');
                setCurrentPage(1);
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <div className="articles-grid">
              {paginatedArticles.map((article) => (
                <article key={article.id} className="article-card">
                  <div className="article-image">
                    <Link to={`${articleBasePath}/${article.id}`} className="article-image-link">
                      <img
                        src={article.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'}
                        alt={article.title}
                      />
                    </Link>
                    {article.category_name && (
                      <span className="article-category">{article.category_name}</span>
                    )}
                    <button
                      type="button"
                      className={`favorite-btn ${favorites.includes(article.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(article.id);
                      }}
                      aria-label={favorites.includes(article.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      title={favorites.includes(article.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      {favorites.includes(article.id) ? '★' : '☆'}
                    </button>
                  </div>
                  <div className="article-body">
                    <div className="article-meta">
                      <span className="article-author">
                        <span className="author-avatar">
                          {(article.author?.username || 'A').charAt(0).toUpperCase()}
                        </span>
                        {article.author?.username || 'Admin'}
                      </span>
                      <span className="meta-dot">•</span>
                      <span>{formatDate(article.published_at)}</span>
                    </div>
                    <h3 className="article-title">
                      <Link to={`${articleBasePath}/${article.id}`}>{article.title}</Link>
                    </h3>
                    <p className="article-excerpt">
                      {(article.content || '').slice(0, 160)}
                      {(article.content || '').length > 160 ? '…' : ''}
                    </p>
                    <Link to={`${articleBasePath}/${article.id}`} className="article-link">
                      Lire l'article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Précédent
                </button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      className={`page-num ${currentPage === num ? 'active' : ''}`}
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Articles;