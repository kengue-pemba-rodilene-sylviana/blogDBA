import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState(null);          // { id, author_name }
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchComments = () => {
    setLoading(true);
    api.get('/comments/')
      .then(r => setComments(r.data))
      .catch(() => setError('Impossible de charger les commentaires.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComments(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce commentaire ? (ses réponses seront aussi supprimées)')) return;
    try {
      await api.delete(`/comments/${id}/`);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {
      alert('Impossible de supprimer ce commentaire.');
    }
  };

  const handleReplyClick = (comment) => {
    setReplyTo({
      id: comment.id,
      articleId: comment.article,
      author_name: comment.author_name || comment.author?.username || 'Anonyme',
    });
    setReplyText('');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyTo) return;

    setPosting(true);
    try {
      const res = await api.post('/comments/', {
        article: replyTo.articleId,
        parent: replyTo.id,
        content: replyText.trim(),
      });

      // Ajoute la réponse à la liste locale
      setComments(prev =>
        prev.map(c =>
          c.id === replyTo.id
            ? { ...c, replies: [...(c.replies || []), res.data] }
            : c
        )
      );

      setReplyTo(null);
      setReplyText('');
    } catch (err) {
      alert("Impossible d'envoyer la réponse.");
    } finally {
      setPosting(false);
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
        <p>Modérez les commentaires et répondez aux lecteurs.</p>
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

      {/* Formulaire de réponse (affiché au-dessus du tableau quand actif) */}
      {replyTo && (
        <div style={{
          background: '#fafaf9',
          border: '1px solid #e7e5e4',
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ margin: 0, fontSize: 13.5, color: '#78716c' }}>
              Répondre à <strong style={{ color: '#1c1917' }}>{replyTo.author_name}</strong>
            </p>
            <button
              type="button"
              onClick={() => { setReplyTo(null); setReplyText(''); }}
              style={{
                background: 'transparent', border: 'none',
                color: '#78716c', cursor: 'pointer', fontSize: 16,
              }}
              title="Annuler"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleReplySubmit}>
            <textarea
              className="form-textarea"
              placeholder="Votre réponse…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              required
              style={{ minHeight: 90 }}
            />
            <div style={{ marginTop: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={posting || !replyText.trim()}>
                {posting ? 'Envoi…' : 'Publier la réponse'}
              </button>
            </div>
          </form>
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
                <th style={{ width: 160 }}></th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <>
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
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginRight: 6 }}
                        onClick={() => handleReplyClick(c)}
                      >
                        Répondre
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>

                  {/* Réponses imbriquées */}
                  {c.replies && c.replies.length > 0 && c.replies.map((r) => (
                    <tr key={`reply-${r.id}`} style={{ background: '#fafaf9' }}>
                      <td>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          paddingLeft: 24,
                        }}>
                          <span style={{ color: '#d4cdb8', fontSize: 18 }}>↳</span>
                          <div className="stat-icon" style={{ width: 24, height: 24, fontSize: 11 }}>
                            {(r.author_name || r.author?.username || '?').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13 }}>
                            {r.author_name || r.author?.username || 'Anonyme'}
                          </span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 360 }}>
                        <div style={{ fontSize: 13.5, color: '#57534e', paddingLeft: 24 }}>
                          {r.content}
                        </div>
                      </td>
                      <td className="muted">—</td>
                      <td className="muted">{formatDate(r.created_at)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(r.id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AdminComments;