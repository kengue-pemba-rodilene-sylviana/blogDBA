import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AuthorShell from './AuthorShell';
import './AuthorDashboard.css';

export default function AuthorStatistics() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/articles/mine/')
      .then((res) => {
        setArticles(res.data.results || res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const count = (status) =>
    articles.filter((article) => article.status === status).length;

  if (loading) {
    return (
      <AuthorShell>
        <p className="author-empty">Chargement des statistiques...</p>
      </AuthorShell>
    );
  }

  return (
    <AuthorShell>
      <div className="author-pagehead">
        <div>
          <span className="author-eyebrow">Suivi</span>
          <h1>Mes <span className="author-accent">statistiques</span></h1>
        </div>
      </div>

      <div className="author-stats">
        <div className="author-stat-card">
          <h3>Total des articles</h3>
          <p>{articles.length}</p>
        </div>

        <div className="author-stat-card">
          <h3>Brouillons</h3>
          <p>{count('draft')}</p>
        </div>

        <div className="author-stat-card">
          <h3>En attente</h3>
          <p>{count('pending')}</p>
        </div>

        <div className="author-stat-card">
          <h3>Publiés</h3>
          <p>{count('published')}</p>
        </div>

        <div className="author-stat-card">
          <h3>Refusés</h3>
          <p>{count('rejected')}</p>
        </div>
      </div>
    </AuthorShell>
  );
}
