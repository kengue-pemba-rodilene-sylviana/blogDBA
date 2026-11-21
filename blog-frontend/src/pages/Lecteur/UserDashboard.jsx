import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  IconArrow, IconBook, IconChat, IconStar,
  IconClock, IconUser, IconSparkle,
} from './LecIcons';

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

  const initial = (user?.username || user?.email || '?').charAt(0).toUpperCase();

  return (
    <div className="lec-dash">
      {/* ACCUEIL */}
      <section className="lec-welcome">
        <div className="lec-welcome-text">
          <p className="lec-eyebrow">Votre espace personnel</p>
          <h1>Bonjour, {user?.username}.</h1>
          <p>Bienvenue dans votre coin de lecture. Reprenez vos lectures ou découvrez de nouveaux articles.</p>
          <Link to="/lecteur/articles" className="lec-btn lec-btn-dark">
            Découvrir les articles <IconArrow size={16} />
          </Link>
        </div>
      </section>

      {/* PANNEAU LATÉRAL */}
      <aside className="lec-dash-side">
        <div className="lec-panel">
          <h2 className="lec-panel-title">Votre activité</h2>

          <div className="lec-stat-row">
            <span className="lec-stat-icon"><IconChat size={20} /></span>
            <p className="lec-stat-label">Commentaires</p>
            <p className="lec-stat-value">{loading ? '—' : comments.length}</p>
          </div>
          <div className="lec-stat-row">
            <span className="lec-stat-icon"><IconBook size={20} /></span>
            <p className="lec-stat-label">Articles lus</p>
            <p className="lec-stat-value">{loading ? '—' : articleViewsCount}</p>
          </div>
          <div className="lec-stat-row">
            <span className="lec-stat-icon"><IconStar size={20} /></span>
            <p className="lec-stat-label">Favoris</p>
            <p className="lec-stat-value">{loading ? '—' : favoritesCount}</p>
          </div>
        </div>

        <div className="lec-panel">
          <h2 className="lec-panel-title">Accès rapide</h2>
          <div className="lec-quicklinks">
            <Link to="/lecteur/history" className="lec-quicklink">
              <IconClock size={18} /> <span>Mon historique</span> <IconArrow size={14} />
            </Link>
            <Link to="/lecteur/comments" className="lec-quicklink">
              <IconChat size={18} /> <span>Mes commentaires</span> <IconArrow size={14} />
            </Link>
            <Link to="/lecteur/profile" className="lec-quicklink">
              <IconUser size={18} /> <span>Mon profil</span> <IconArrow size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* ACTIVITÉ RÉCENTE */}
      <section className="lec-activity">
        <div className="lec-section-head">
          <h2 className="lec-section-title">Activité récente</h2>
          <Link to="/lecteur/comments" className="lec-section-link">
            Tout voir
          </Link>
        </div>

        {loading ? (
          <div className="lec-empty"><p>Chargement…</p></div>
        ) : comments.length === 0 ? (
          <div className="lec-empty">
            <div className="lec-empty-icon"><IconSparkle size={26} /></div>
            <h3>Votre histoire commence ici</h3>
            <p>Vous n'avez pas encore commenté d'article.</p>
            <Link to="/lecteur/articles" className="lec-btn lec-btn-primary">
              Découvrir les articles
            </Link>
          </div>
        ) : (
          <div className="lec-timeline">
            {comments.slice(0, 5).map((c) => (
              <div key={c.id} className="lec-tl-item">
                <span className="lec-avatar">{initial}</span>
                <div>
                  <div className="lec-tl-head">
                    <Link to={`/lecteur/articles/${c.article}`} className="lec-tl-title">
                      Article #{c.article}
                    </Link>
                    <span className="lec-tl-time">{formatRelative(c.created_at)}</span>
                  </div>
                  <p className="lec-tl-text">« {c.content} »</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;