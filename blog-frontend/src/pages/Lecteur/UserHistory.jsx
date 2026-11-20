import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './UserHistory.css';

const PERIODS = [
  { value: 'all',   label: 'Tout' },
  { value: '7d',    label: '7 derniers jours' },
  { value: '30d',   label: '30 derniers jours' },
  { value: '90d',   label: '3 derniers mois' },
];

const UserHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');
  const [category, setCategory] = useState('all');

  // ---- Chargement ----
  useEffect(() => {
    api.get('/article-views/')
      .then((res) => setHistory(res.data))
      .catch(() => setError("Impossible de charger l'historique."))
      .finally(() => setLoading(false));
  }, []);

  // ---- Catégories dynamiques ----
  const categories = useMemo(() => {
    const unique = [...new Set(history.map((h) => h.category_name).filter(Boolean))];
    return unique.sort();
  }, [history]);

  // ---- Filtrage ----
  const filtered = useMemo(() => {
    let result = history;

    // Recherche
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((h) =>
        (h.article_title || '').toLowerCase().includes(q)
      );
    }

    // Catégorie
    if (category !== 'all') {
      result = result.filter((h) => h.category_name === category);
    }

    // Période
    if (period !== 'all') {
      const days = { '7d': 7, '30d': 30, '90d': 90 }[period];
      const limit = Date.now() - days * 86400 * 1000;
      result = result.filter((h) => new Date(h.viewed_at).getTime() >= limit);
    }

    return result;
  }, [history, search, category, period]);

  // ---- Actions ----
  const removeItem = async (id) => {
    if (!window.confirm('Retirer cet article de votre historique ?')) return;
    try {
      await api.delete(`/article-views/${id}/`);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      alert('Impossible de retirer cet article.');
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Effacer tout votre historique ? Cette action est irréversible.')) return;
    try {
      await api.delete('/article-views/clear/');
      setHistory([]);
    } catch {
      alert("Impossible d'effacer l'historique.");
    }
  };

  // ---- Formatage ----
  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatRelative = (iso) => {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
    return formatDate(iso);
  };

  // ---- Rendu ----
  return (
    <div className="history-page">
      {/* HERO */}
      <section className="history-hero">
        <p className="history-eyebrow">Votre parcours de lecture</p>
        <h1>Mon historique</h1>
        <p>Retrouvez tous les articles que vous avez consultés récemment.</p>
      </section>

      {/* CONTROLS */}
      {history.length > 0 && (
        <section className="history-controls">
          <div className="history-search">
            <span className="history-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="history-search-clear" onClick={() => setSearch('')} aria-label="Effacer">
                ✕
              </button>
            )}
          </div>

          <select className="history-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <select className="history-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button className="history-btn-clear" onClick={clearAll}>
            Effacer l'historique
          </button>
        </section>
      )}

      {/* RESULTS */}
      {loading ? (
        <div className="history-empty"><p>Chargement…</p></div>
      ) : error ? (
        <div className="history-empty">
          <div className="history-empty-icon">⚠</div>
          <h3>{error}</h3>
        </div>
      ) : history.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">📖</div>
          <h3>Vous n'avez pas encore consulté d'article</h3>
          <p>Vos lectures apparaîtront ici au fur et à mesure.</p>
          <Link to="/lecteur/articles" className="history-btn history-btn-primary">
            Découvrir les articles
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">🔍</div>
          <h3>Aucun résultat</h3>
          <p>Essayez de modifier votre recherche ou vos filtres.</p>
          <button
            className="history-btn history-btn-outline"
            onClick={() => { setSearch(''); setCategory('all'); setPeriod('all'); }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((item) => (
            <article key={item.id} className="history-card">
              <div className="history-card-image">
                <img
                  src={item.article_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'}
                  alt={item.article_title}
                />
              </div>

              <div className="history-card-body">
                <div className="history-card-meta">
                  {item.category_name && (
                    <span className="history-card-tag">{item.category_name}</span>
                  )}
                  <span className="history-card-date">
                    Consulté {formatRelative(item.viewed_at)}
                  </span>
                </div>

                <h3 className="history-card-title">{item.article_title}</h3>

                {typeof item.progress === 'number' && item.progress > 0 && (
                  <div className="history-progress">
                    <div className="history-progress-bar">
                      <div
                        className="history-progress-fill"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="history-progress-label">{item.progress}% lu</span>
                  </div>
                )}

                <div className="history-card-actions">
                  <Link
                    to={`/lecteur/articles/${item.article}`}
                    className="history-btn history-btn-primary"
                  >
                    Reprendre la lecture →
                  </Link>
                  <button
                    className="history-btn history-btn-text"
                    onClick={() => removeItem(item.id)}
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserHistory;