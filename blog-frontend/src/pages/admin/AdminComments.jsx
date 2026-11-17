import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = () => {
    setLoading(true);
    api.get('/comments/')
      .then(r => setComments(r.data))
      .catch(() => setError('Impossible de charger les commentaires.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComments(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await api.delete(`/comments/${id}/`);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Impossible de supprimer ce commentaire.');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      <div className="page-header">
        <h1>Commentaires</h1>
        <p>Modérez les commentaires laissés par les lecteurs.</p>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#b91c1c', padding: '10px 14px',
          borderRadius: 6, fontSize: 13, marginBottom: 20,
        }}>
          ⚠ {error}
        </div>
      )}

      <div className="data-table-wrapper">
        {loading ? (
          <div className="empty-state"><p>Chargement…</p></div>
        ) : comments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <p>Aucun commentaire pour le moment.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Auteur</th>
                <th>Commentaire</th>
                <th style={{ width: 180 }}>Article</th>
                <th style={{ width: 160 }}>Date</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="stat-icon" style={{ width: 28, height: 28, fontSize: 12 }}>
                        {(c.author_name || c.author?.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <span>{c.author_name || c.author?.username || 'Anonyme'}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: 360 }}>
                    <div style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.5,
                    }}>
                      {c.content}
                    </div>
                  </td>
                  <td className="muted">
                    {c.article_title || `Article #${c.article}`}
                  </td>
                  <td className="muted">{formatDate(c.created_at)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(c.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AdminComments;