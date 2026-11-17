import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitial = () => {
    if (!user) return '?';
    return (user.username || user.email || '?').charAt(0).toUpperCase();
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon"></span>
          <span className="admin-brand-text">Bookfolio</span>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className="admin-nav-link">
            <span></span> Vue d'ensemble
          </NavLink>
          <NavLink to="/admin/articles" className="admin-nav-link">
            <span></span> Articles
          </NavLink>
          <NavLink to="/admin/articles/new" className="admin-nav-link">
            <span></span> Nouvel article
          </NavLink>
          <NavLink to="/admin/categories" className="admin-nav-link">
            <span></span> Catégories
          </NavLink>
          <NavLink to="/admin/comments" className="admin-nav-link">
            <span></span> Commentaires
          </NavLink>
          <NavLink to="/admin/users" className="admin-nav-link">
            <span></span> Utilisateurs
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <span className="admin-avatar">{getInitial()}</span>
            <div>
              <strong>{user?.username || 'Admin'}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="admin-logout" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;