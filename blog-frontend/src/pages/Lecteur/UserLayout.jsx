import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Lecteur.css';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const getInitial = () => {
    if (!user) return '?';
    return (user.username || user.email || '?').charAt(0).toUpperCase();
  };

  return (
    <div className="lec-app">
      <header className="lec-topbar">
        <NavLink to="/lecteur" className="lec-brand">
          <span className="lec-brand-icon"></span>
          Bookfolio
          <span className="lec-brand-tag">Lecteur</span>
        </NavLink>

        <nav className="lec-nav">
          <NavLink to="/lecteur/profile" className="lec-nav-item">Profil</NavLink>
          <NavLink to="/lecteur/articles" className="lec-nav-item">Articles</NavLink>
          <NavLink to="/lecteur/history" className="lec-nav-item">Historique</NavLink>  
          <NavLink to="/lecteur/comments" className="lec-nav-item">Commentaires</NavLink>
          <NavLink to="/lecteur/password" className="lec-nav-item">Mot de passe</NavLink>

        </nav>

        <div className="lec-user-menu">
          <span className="lec-avatar" title={user?.username}>{getInitial()}</span>
          <button className="lec-logout-icon" onClick={handleLogout} title="Déconnexion">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="lec-main">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;