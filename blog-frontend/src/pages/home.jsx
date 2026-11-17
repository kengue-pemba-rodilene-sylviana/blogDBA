import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './home.css';

const Home = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/articles/')
      .then((res) => setArticles(res.data.slice(0, 6)))   // 6 derniers
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="home">

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">✦ Bienvenue sur Bookfolio</span>
          <h1 className="hero-title">
            Votre bibliothèque personnelle,<br />
            <span className="hero-accent">à votre rythme.</span>
          </h1>
          <p className="hero-subtitle">
            Découvrez des articles, partagez vos lectures et explorez un espace
            où chaque livre trouve sa place. Un lieu pensé pour les passionnés de mots.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to={user.is_superuser || user.role === 'admin' ? '/admin' : '/lecteur'} className="btn btn-primary">
                Accéder à mon espace
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Créer un compte
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Se connecter
                </Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>+9</strong>
              <span>Articles publiés</span>
            </div>
            <div className="stat">
              <strong>+15</strong>
              <span>Lecteurs actifs</span>
            </div>
            <div className="stat">
              <strong>+20</strong>
              <span>Auteurs</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80"
              alt="Bibliothèque"
            />
            <div className="hero-card-float">
              <div>
                <strong>Nouvelle parution</strong>
                <span>Chaque semaine</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION ARTICLES ===== */}
      <section className="articles-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Derniers articles</h2>
            <p className="section-subtitle">
              Les publications récentes de notre communauté
            </p>
          </div>
          <Link to="/articles" className="link-view-all">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <p className="home-loading">Chargement des articles…</p>
        ) : articles.length === 0 ? (
          <p className="home-empty">Aucun article publié pour le moment.</p>
        ) : (
          <div className="articles-grid">
            {articles.map((article) => (
              <article key={article.id} className="article-card">
                <Link to={`/articles/${article.id}`} className="article-image-link">
                  <div className="article-image">
                    <img
                      src={article.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'}
                      alt={article.title}
                    />
                    {article.category_name && (
                      <span className="article-category">{article.category_name}</span>
                    )}
                  </div>
                </Link>
                <div className="article-body">
                  <div className="article-meta">
                    <span>{formatDate(article.published_at)}</span>
                    <span>•</span>
                    <span>{article.author?.username || 'Admin'}</span>
                  </div>
                  <h3 className="article-title">
                    <Link to={`/articles/${article.id}`}>{article.title}</Link>
                  </h3>
                  <p className="article-excerpt">
                    {(article.content || '').slice(0, 140)}
                    {(article.content || '').length > 140 ? '…' : ''}
                  </p>
                  <Link to={`/articles/${article.id}`} className="article-link">
                    Lire l'article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à partager vos lectures ?</h2>
          <p>
            Rejoignez une communauté de passionnés et commencez à publier vos propres articles.
          </p>
          {!user && (
            <Link to="/register" className="btn btn-primary">
              Rejoindre Bookfolio
            </Link>
          )}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>Bookfolio</strong>
            <p>Votre bibliothèque personnelle, à votre rythme.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Navigation</h4>
              <Link to="/articles">Articles</Link>
              <Link to="/about">À propos</Link>
            </div>
            <div>
              <h4>Compte</h4>
              <Link to="/login">Connexion</Link>
              <Link to="/register">Inscription</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Bookfolio. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
