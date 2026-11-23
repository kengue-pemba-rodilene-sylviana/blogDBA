import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AuthorShell from './AuthorShell';
import { IconChat } from './AuthorIcons';
import './AuthorDashboard.css';

export default function AuthorComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/articles/mine/')
      .then((res) => {
        const articles = res.data.results || res.data;

        const allComments = articles.flatMap((article) =>
          (article.comments || []).map((comment) => ({
            ...comment,
            articleTitle: article.title
          }))
        );

        setComments(allComments);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AuthorShell>
        <p className="author-empty">Chargement des commentaires...</p>
      </AuthorShell>
    );
  }

  return (
    <AuthorShell>
      <div className="author-pagehead">
        <div>
          <span className="author-eyebrow">Communauté</span>
          <h1>Commentaires sur <span className="author-accent">mes articles</span></h1>
        </div>
      </div>

      <div className="author-content-card">
        {comments.length === 0 ? (
          <div className="author-empty">
            <div className="author-empty-icon"><IconChat size={26} /></div>
            <p>Aucun commentaire pour le moment.</p>
          </div>
        ) : (
          <div className="author-table-wrapper">
            <table className="author-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Commentaire</th>
                  <th>Auteur</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {comments.map((comment) => (
                  <tr key={comment.id}>
                    <td className="article-title-cell">{comment.articleTitle}</td>
                    <td>{comment.content}</td>
                    <td className="author-muted">{comment.author_name || comment.user?.username || 'Utilisateur'}</td>
                    <td className="author-muted">
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthorShell>
  );
}
