import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconHome, IconUser, IconBook, IconClock, IconChat, IconLock, IconLogout, IconClose,
} from './LecIcons';
import './Lecteur.css';

const NAV_ITEMS = [
  { to: '/lecteur', label: 'Accueil', Icon: IconHome, end: true },
  { to: '/lecteur/articles', label: 'Articles', Icon: IconBook },
  { to: '/lecteur/history', label: 'Historique', Icon: IconClock },
  { to: '/lecteur/comments', label: 'Commentaires', Icon: IconChat },
  { to: '/lecteur/profile', label: 'Profil', Icon: IconUser },
  { to: '/lecteur/password', label: 'Mot de passe', Icon: IconLock },
];

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const getInitial = () => {
    if (!user) return '?';
    return (user.username || user.email || '?').charAt(0).toUpperCase();
  };

  const closeMenu = () => setMenuOpen(false);

  // Titre de la page courante dans la topbar
  const current = NAV_ITEMS.find((i) =>
    i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)
  );

  // Ferme le menu à chaque changement de page
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Echap pour fermer
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Bloque le scroll quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="lec-app">
      {/* Overlay mobile */}
      <div
        className={`lec-overlay ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Rail latéral (desktop) / tiroir (mobile) */}
      <aside className={`lec-rail ${menuOpen ? 'open' : ''}`}>
        <div className="lec-rail-top">
          <NavLink to="/lecteur" end className="lec-rail-brand" aria-label="Bookfolio" onClick={closeMenu}>
            <IconBook size={22} />
          </NavLink>
          <span className="lec-rail-brandtext">Bookfolio</span>
          <button
            type="button"
            className="lec-rail-close"
            onClick={closeMenu}
            aria-label="Fermer le menu"
          >
            <IconClose size={18} />
          </button>
        </div>

        <nav className="lec-rail-nav" aria-label="Navigation principale">
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="lec-rail-link"
              data-label={label}
              aria-label={label}
              onClick={closeMenu}
            >
              <Icon size={22} />
              <span className="lec-rail-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="lec-rail-foot">
          <div className="lec-rail-user">
            <span className="lec-avatar">{getInitial()}</span>
            <div style={{ minWidth: 0 }}>
              <strong>{user?.username || 'Lecteur'}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button
            type="button"
            className="lec-rail-link lec-rail-logout"
            data-label="Déconnexion"
            aria-label="Déconnexion"
            onClick={handleLogout}
          >
            <IconLogout size={22} />
            <span className="lec-rail-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="lec-shell">
        <header className="lec-topbar">
          <div className="lec-topbar-left">
            <button
              type="button"
              className="lec-burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
            <h2 className="lec-topbar-title">{current?.label || 'Bookfolio'}</h2>
          </div>

          <div className="lec-userchip" title={user?.email}>
            <span className="lec-userchip-name">{user?.username}</span>
            <span className="lec-avatar">{getInitial()}</span>
          </div>
        </header>

        <main className="lec-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;