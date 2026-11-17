import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);        // burger mobile
  const [userMenuOpen, setUserMenuOpen] = useState(false); // dropdown user
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  // Fermer les menus au changement de route
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Détecter le scroll pour ajouter une ombre
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Initiale pour l'avatar
  const getInitial = () => {
    if (!user) return '';
    return (user.username || user.email || '?').charAt(0).toUpperCase();
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">

        {/* ---- LOGO ---- */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">
            Book<span className="logo-accent">folio</span>
          </span>
        </Link>

        {/* ---- LIENS CENTRAUX (desktop) ---- */}
        <nav className="navbar-links">
          <NavLink to="/" className="nav-link" end>
            Accueil
          </NavLink>
          <NavLink to="/articles" className="nav-link">
            Articles
          </NavLink>
          <NavLink to="/about" className="nav-link">
            À propos
          </NavLink>
          {user?.role === 'auteur' && (
            <NavLink to="/dashboard" className="nav-link">
              Mon espace
            </NavLink>
          )}
        </nav>

        {/* ---- ZONE DROITE ---- */}
        <div className="navbar-right">

          {/* Visiteur non connecté */}
          {!user && (
            <div className="navbar-auth-buttons">
              <Link to="/login" className="btn-nav btn-nav-ghost">
                Connexion
              </Link>
              <Link to="/register" className="btn-nav btn-nav-primary">
                S'inscrire
              </Link>
            </div>
          )}

          {/* Utilisateur connecté */}
          {user && (
            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
              >
                <span className="user-avatar">{getInitial()}</span>
                <span className="user-info-desktop">
                  <strong>{user.username || 'Utilisateur'}</strong>
                  <small>{user.role || 'lecteur'}</small>
                </span>
                <span className={`chevron ${userMenuOpen ? 'open' : ''}`}>▾</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <span className="user-avatar large">{getInitial()}</span>
                    <div>
                      <strong>{user.username || 'Utilisateur'}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/dashboard" className="dropdown-item">
                    <span>📊</span> Tableau de bord
                  </Link>
                  <Link to="/profile" className="dropdown-item">
                    <span>👤</span> Mon profil
                  </Link>
                  {user.role === 'auteur' && (
                    <Link to="/create-article" className="dropdown-item">
                      <span>✍️</span> Nouvel article
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <span>🚪</span> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Burger mobile */}
          <button
            className={`burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* ---- MENU MOBILE ---- */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" className="mobile-link" end>Accueil</NavLink>
        <NavLink to="/articles" className="mobile-link">Articles</NavLink>
        <NavLink to="/about" className="mobile-link">À propos</NavLink>

        {user ? (
          <>
            <NavLink to="/dashboard" className="mobile-link">Tableau de bord</NavLink>
            <NavLink to="/profile" className="mobile-link">Mon profil</NavLink>
            {user.role === 'auteur' && (
              <NavLink to="/create-article" className="mobile-link">Nouvel article</NavLink>
            )}
            <button className="mobile-link logout" onClick={handleLogout}>
              Se déconnecter
            </button>
          </>
        ) : (
          <div className="mobile-auth">
            <Link to="/login" className="btn-nav btn-nav-ghost">Connexion</Link>
            <Link to="/register" className="btn-nav btn-nav-primary">S'inscrire</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;