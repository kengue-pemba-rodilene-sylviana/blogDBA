import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [articleViewsCount, setArticleViewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const countOf = (data) =>
      Array.isArray(data) ? data.length : data?.count ?? 0;

    Promise.all([
      api.get('/comments/'),
      api.get('/favorites/'),
      api.get('/article-views/'),
    ])
      .then(([commentsRes, favoritesRes, viewsRes]) => {
        const mine = commentsRes.data.filter(
          (c) => (c.author?.id || c.author) === user?.id
        );
        setComments(mine);
        setFavoritesCount(countOf(favoritesRes.data));
        setArticleViewsCount(countOf(viewsRes.data));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const formatRelative = (iso) => {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <>
      {/* HERO */}
      <section className="lec-hero">
        <p className="lec-hero-eyebrow">Votre espace personnel</p>
        <h1>Bonjour, {user?.username}.</h1>
        <p>Bienvenue dans votre coin de lecture.</p>
      </section>

      {/* STATS */}
      <div className="lec-stats">
        <div className="lec-stat">
          <p className="lec-stat-value">{loading ? '—' : comments.length}</p>
          <p className="lec-stat-label">Commentaires</p>
        </div>
        <div className="lec-stat">
          <p className="lec-stat-value">{loading ? '—' : articleViewsCount}</p>
          <p className="lec-stat-label">Articles lus</p>
        </div>
        <div className="lec-stat">
          <p className="lec-stat-value">{loading ? '—' : favoritesCount}</p>
          <p className="lec-stat-label">Favoris</p>
        </div>
      </div>

      {/* ACTIVITÉ RÉCENTE */}
      <div className="lec-section-head">
        <h2 className="lec-section-title">Activité récente</h2>
        <Link to="/lecteur/comments" className="lec-section-link">
          Tout voir →
        </Link>
      </div>

      {loading ? (
        <div className="lec-empty"><p>Chargement…</p></div>
      ) : comments.length === 0 ? (
        <div className="lec-empty">
          <h3>Votre histoire commence ici</h3>
          <p>Vous n'avez pas encore commenté d'article.</p>
          <Link to="/lecteur/articles" className="lec-btn lec-btn-primary">
            Découvrir les articles
          </Link>
        </div>
      ) : (
        <div className="lec-comments">
          {comments.slice(0, 5).map((c) => (
            <div key={c.id} className="lec-comment-card">
              <p className="lec-comment-quote">« {c.content} »</p>
              <div className="lec-comment-meta">
                <Link to={`/lecteur/articles/${c.article}`} className="lec-comment-article">
                  Article #{c.article}
                </Link>
                <span className="lec-comment-sep">·</span>
                <span>{formatRelative(c.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default UserDashboard;