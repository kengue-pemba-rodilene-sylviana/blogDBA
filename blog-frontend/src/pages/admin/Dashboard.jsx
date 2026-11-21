import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    articles: '—',
    comments: '—',
    users: '—',
    replies: '—',
  });
  const [recentReplies, setRecentReplies] = useState([]);

  useEffect(() => {
    const countOf = (data) => (Array.isArray(data) ? data.length : data?.count ?? 0);

    Promise.all([
      api.get('/articles/').catch(() => ({ data: [] })),
      api.get('/comments/').catch(() => ({ data: [] })),
      api.get('/admin/users/').catch(() => ({ data: [] })),
    ]).then(([articles, comments, users]) => {
      const allComments = comments.data || [];

      // Aplatir toutes les réponses (chaque commentaire a un tableau "replies")
      const allReplies = allComments.flatMap((c) =>
        (c.replies || []).map((r) => ({
          ...r,
          parent_content: c.content,
          parent_id: c.id,
        }))
      );

      // Trier par date desc et garder les 5 plus récentes
      allReplies.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setStats({
        articles: countOf(articles.data),
        comments: countOf(allComments),
        users: countOf(users.data),
        replies: allReplies.length,
      });

      setRecentReplies(allReplies.slice(0, 5));
    });
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Vue d'ensemble</h1>
        <p>Bienvenue sur votre espace d'administration Bookfolio.</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <p className="stat-label">Articles</p>
          <p className="stat-value">{stats.articles}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Commentaires</p>
          <p className="stat-value">{stats.comments}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Réponses</p>
          <p className="stat-value">{stats.replies}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Utilisateurs</p>
          <p className="stat-value">{stats.users}</p>
        </div>
      </div>

      {/* Section réponses récentes */}
      <div className="page-header" style={{ marginTop: 40, marginBottom: 16 }}>
        <h1 style={{ fontSize: 16 }}>Dernières réponses</h1>
      </div>

      {recentReplies.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '1px solid #e7e5e4',
          borderRadius: 10,
          padding: 40,
          textAlign: 'center',
          color: '#78716c',
          fontSize: 14,
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
          <p style={{ margin: 0 }}>Aucune réponse pour le moment.</p>
          <Link
            to="/admin/comments"
            className="btn btn-primary btn-sm"
            style={{ marginTop: 16, textDecoration: 'none' }}
          >
            Modérer les commentaires
          </Link>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          border: '1px solid #e7e5e4',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          {recentReplies.map((r, i) => (
            <div
              key={r.id}
              style={{
                padding: '16px 20px',
                borderBottom: i < recentReplies.length - 1 ? '1px solid #f5f5f4' : 'none',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#7c2d12', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600,
                }}>
                  {(r.author_name || r.author?.username || '?').charAt(0).toUpperCase()}
                </div>
                <strong style={{ fontSize: 13.5, color: '#1c1917' }}>
                  {r.author_name || r.author?.username || 'Anonyme'}
                </strong>
                <span style={{ fontSize: 12, color: '#78716c' }}>
                  {formatDate(r.created_at)}
                </span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  background: '#7c2d12', color: '#fff',
                  padding: '2px 8px', borderRadius: 8,
                  fontWeight: 500,
                }}>
                  Réponse
                </span>
              </div>

              {/* Réponse */}
              <p style={{
                margin: '0 0 8px 34px',
                fontSize: 13.5,
                color: '#1c1917',
                lineHeight: 1.5,
              }}>
                {r.content}
              </p>

              {/* Contexte : commentaire d'origine */}
              <div style={{
                marginLeft: 34,
                padding: '8px 12px',
                background: '#fafaf9',
                borderLeft: '3px solid #d4cdb8',
                borderRadius: 4,
                fontSize: 12.5,
                color: '#78716c',
                fontStyle: 'italic',
              }}>
                En réponse à : « {(r.parent_content || '').slice(0, 100)}
                {(r.parent_content || '').length > 100 ? '…' : ''} »
              </div>
            </div>
          ))}

          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #f5f5f4',
            textAlign: 'right',
          }}>
            <Link
              to="/admin/comments"
              style={{
                fontSize: 13,
                color: '#7c2d12',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Voir tous les commentaires →
            </Link>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="page-header" style={{ marginTop: 40 }}>
        <h1 style={{ fontSize: 16 }}>Actions rapides</h1>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link to="/admin/articles/new" className="btn btn-primary">Créer un article</Link>
        <Link to="/admin/articles" className="btn btn-secondary">Voir tous les articles</Link>
        <Link to="/admin/comments" className="btn btn-secondary">Modérer les commentaires</Link>
      </div>
    </div>
  );
};

export default Dashboard;