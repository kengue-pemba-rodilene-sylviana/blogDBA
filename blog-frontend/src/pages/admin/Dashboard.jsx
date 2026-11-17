import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({ articles: '—', comments: '—', users: '—' });

  useEffect(() => {
    const countOf = (data) => (Array.isArray(data) ? data.length : data?.count ?? 0);

    Promise.all([
      api.get('/articles/').catch(() => ({ data: [] })),
      api.get('/comments/').catch(() => ({ data: [] })),
      api.get('/admin/users/').catch(() => ({ data: [] })),
    ]).then(([articles, comments, users]) => {
      setStats({
        articles: countOf(articles.data),
        comments: countOf(comments.data),
        users: countOf(users.data),
      });
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Vue d'ensemble</h1>
        <p>Bienvenue sur votre espace d'administration Bookfolio.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Articles</p>
          <p className="stat-value">{stats.articles}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Commentaires</p>
          <p className="stat-value">{stats.comments}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Utilisateurs</p>
          <p className="stat-value">{stats.users}</p>
        </div>
      </div>

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