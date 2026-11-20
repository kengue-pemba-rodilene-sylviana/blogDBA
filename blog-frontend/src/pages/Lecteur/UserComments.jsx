import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const UserComments = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/comments/')
      .then((r) => {
        const mine = r.data.filter(
          (c) => (c.author?.id || c.author) === user?.id
        );
        setComments(mine);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await api.delete(`/comments/${id}/`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Impossible de supprimer ce commentaire.');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  return (
    <>
      <section className="lec-hero">
        <p className="lec-hero-eyebrow">Votre voix</p>
        <h1>Mes commentaires</h1>
        <p>Toutes vos pensées partagées sur les articles.</p>
      </section>

      {loading ? (
        <div className="lec-empty"><p>Chargement…</p></div>
      ) : comments.length === 0 ? (
        <div className="lec-empty">
          <h3>Vous n'avez pas encore écrit</h3>
          <p>Vos commentaires apparaîtront ici.</p>
          <Link to="/lecteur/articles" className="lec-btn lec-btn-primary">
            Parcourir les articles
          </Link>
        </div>
      ) : (
        <div className="lec-comments">
          {comments.map((c) => (
            <div key={c.id} className="lec-comment-card">
              <p className="lec-comment-quote">« {c.content} »</p>
              <div className="lec-comment-meta" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link to={`/lecteur/articles/${c.article}`} className="lec-comment-article">
                    {c.article_title || `Article #${c.article}`}
                  </Link>
                  <span className="lec-comment-sep">·</span>
                  <span>{formatDate(c.created_at)}</span>
                </div>
                <button className="lec-btn-text" onClick={() => handleDelete(c.id)}>
                  Supprimer
                </button>
              </div>

              {/* ===== RÉPONSES (fournies par l'API) ===== */}
              {c.replies && c.replies.length > 0 && (
                <div className="lec-replies">
                  <p className="lec-replies-title">
                    {c.replies.length} réponse{c.replies.length > 1 ? 's' : ''}
                  </p>
                  {c.replies.map((r) => (
                    <div key={r.id} className="lec-reply">
                      <div className="lec-reply-header">
                        <span className="lec-reply-author">
                          {r.author_name || 'Anonyme'}
                        </span>
                        <span className="lec-comment-sep">·</span>
                        <span>{formatDate(r.created_at)}</span>
                      </div>
                      <p className="lec-reply-content">« {r.content} »</p>
                      {/* Sous-réponses éventuelles (récursif 1 niveau) */}
                      {r.replies && r.replies.length > 0 && (
                        <div className="lec-replies" style={{ marginTop: 8 }}>
                          {r.replies.map((rr) => (
                            <div key={rr.id} className="lec-reply">
                              <div className="lec-reply-header">
                                <span className="lec-reply-author">
                                  {rr.author_name || 'Anonyme'}
                                </span>
                                <span className="lec-comment-sep">·</span>
                                <span>{formatDate(rr.created_at)}</span>
                              </div>
                              <p className="lec-reply-content">« {rr.content} »</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default UserComments;