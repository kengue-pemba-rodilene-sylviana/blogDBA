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
    api.post('/article-views/', { article: Number(id) })
      .catch((err) => console.error('Track article:', err.response?.status, err.response?.data));
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
              <li key={c.id} className="comment-item">
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ArticleDetail;