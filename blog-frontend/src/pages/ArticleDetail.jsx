import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    Promise.all([
      api.get(`/articles/${id}/`),
      api.get(`/comments/?article=${id}`),
    ])
      .then(([a, c]) => {
        setArticle(a.data);
        setComments(c.data);
      })
      .catch(() => setError("Impossible de charger l'article."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
  if (!user || !id) return;

  let lastSent = 0;

  const sendProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0
      ? Math.min(100, Math.round((scrollTop / docHeight) * 100))
      : 0;

    // Envoie seulement si progression ≥ 10% ou 100% atteint
    if (progress - lastSent >= 10 || progress === 100) {
      lastSent = progress;
      api.post('/article-views/', { article: Number(id), progress })
        .catch(() => {});
    }
  };

  // Enregistrement initial (article ouvert, 0%)
  api.post('/article-views/', { article: Number(id), progress: 0 })
    .catch(() => {});

  // Tracking scroll
  window.addEventListener('scroll', sendProgress, { passive: true });

  // Marquer 100% à la fermeture
  return () => {
    window.removeEventListener('scroll', sendProgress);
    api.post('/article-views/', { article: Number(id), progress: 100 }).catch(() => {});
  };
}, [user, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);
    setError('');
    try {
      const res = await api.post('/comments/', {
        article: Number(id),
        content: newComment.trim(),
      });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      setError("Impossible d'envoyer le commentaire. Connectez-vous.");
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className="article-loading">Chargement…</div>;
  if (error && !article) return <div className="article-error">{error}</div>;
  if (!article) return null;

  return (
    <div className="article-detail">
      <article>
        <Link to="/lecteur" className="back-link">← Retour aux articles</Link>
        <h1>{article.title}</h1>
        <div className="article-meta">
          Par <strong>{article.author?.username || 'Admin'}</strong>
          {article.category_name && <> · <span>{article.category_name}</span></>}
        </div>
        {article.image_url && (
          <img src={article.image_url} alt={article.title} className="article-image" />
        )}
        <div className="article-content">{article.content}</div>
      </article>

      <section className="comments-section">
        <h2>
          Commentaires <span className="comment-count">{comments.length}</span>
        </h2>

        {user ? (
          <form onSubmit={handleSubmit} className="comment-form">
            <textarea
              placeholder="Partagez votre avis sur ce livre/article…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              required
            />
            {error && <p className="form-error">{error}</p>}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={posting || !newComment.trim()}
            >
              {posting ? 'Envoi…' : 'Publier le commentaire'}
            </button>
          </form>
        ) : (
          <p className="comment-login-prompt">
            <Link to="/login">Connectez-vous</Link> pour laisser un commentaire.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="comments-empty">
            Aucun commentaire pour le moment. Soyez le premier !
          </p>
        ) : (
          <ul className="comments-list">
            {comments.map((c) => (
              <li key={c.id} className="comment-item-wrapper">
                {/* Commentaire principal */}
                <div className="comment-item">
                  <div className="comment-avatar">
                    {(c.author_name || c.author?.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <strong>{c.author_name || c.author?.username || 'Anonyme'}</strong>
                      <span className="comment-date">
                        {new Date(c.created_at || Date.now()).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="comment-text">{c.content}</p>
                  </div>
                </div>

                {/* Réponses imbriquées */}
                {c.replies && c.replies.length > 0 && (
                  <ul className="comment-replies">
                    {c.replies.map((r) => (
                      <li key={r.id} className="comment-item comment-reply">
                        <div className="comment-avatar" style={{ background: '#7c2d12' }}>
                          {(r.author_name || r.author?.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="comment-body">
                          <div className="comment-header">
                            <strong>
                              {r.author_name || r.author?.username || 'Anonyme'}
                              <span style={{
                                marginLeft: 8, fontSize: 11,
                                background: '#7c2d12', color: '#fff',
                                padding: '1px 6px', borderRadius: 8,
                              }}>
                                Admin
                              </span>
                            </strong>
                            <span className="comment-date">
                              {new Date(r.created_at || Date.now()).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="comment-text">{r.content}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ArticleDetail;