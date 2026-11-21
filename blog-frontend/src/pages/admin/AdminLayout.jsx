import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconBook, IconHome, IconFile, IconPlus, IconFolder, IconChat,
  IconUsers, IconUser, IconLock, IconLogout, IconClose,
} from './AdminIcons';
import './Admin.css';

const NAV_MAIN = [
  { to: '/admin', label: "Vue d'ensemble", Icon: IconHome, end: true },
  { to: '/admin/articles', label: 'Articles', Icon: IconFile, end: true },
  { to: '/admin/articles/new', label: 'Nouvel article', Icon: IconPlus },
  { to: '/admin/categories', label: 'Catégories', Icon: IconFolder },
  { to: '/admin/comments', label: 'Commentaires', Icon: IconChat },
  { to: '/admin/users', label: 'Utilisateurs', Icon: IconUsers },
];

const NAV_ACCOUNT = [
  { to: '/admin/profile', label: 'Mon profil', Icon: IconUser },
  { to: '/admin/password', label: 'Mot de passe', Icon: IconLock },
];

const ALL_ITEMS = [...NAV_MAIN, ...NAV_ACCOUNT];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitial = () => {
    if (!user) return '?';
    return (user.username || user.email || '?').charAt(0).toUpperCase();
  };

  const closeMenu = () => setMenuOpen(false);

  // Titre de la page courante dans la topbar (le chemin le plus précis gagne)
  const current = [...ALL_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) =>
      i.to === '/admin'
        ? location.pathname === '/admin'
        : location.pathname.startsWith(i.to)
    );

  // Ferme le menu à chaque changement de page
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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

  const renderLink = ({ to, label, Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className="admin-nav-link"
      data-label={label}
      aria-label={label}
      onClick={closeMenu}
    >
      <Icon size={22} />
      <span className="admin-nav-label">{label}</span>
    </NavLink>
  );

  return (
    <div className="admin-layout">
      {/* OVERLAY (mobile) */}
      <div
        className={`admin-overlay ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* BARRE LATERALE (desktop) / TIROIR (mobile) */}
      <aside className={`admin-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <span className="admin-brand-icon"><IconBook size={22} /></span>
          <span className="admin-brand-text">Bookfolio</span>
          <span className="admin-badge">Admin</span>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeMenu}
            aria-label="Fermer le menu"
          >
            <IconClose size={18} />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Navigation principale">
          {NAV_MAIN.map(renderLink)}

          {/* Séparateur */}
          <div className="admin-nav-separator" />

          {NAV_ACCOUNT.map(renderLink)}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <span className="admin-avatar">{getInitial()}</span>
            <div>
              <strong>{user?.username || 'Admin'}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button
            type="button"
            className="admin-nav-link admin-logout"
            data-label="Déconnexion"
            aria-label="Déconnexion"
            onClick={handleLogout}
          >
            <IconLogout size={22} />
            <span className="admin-nav-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* CONTENU */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
            <h2 className="admin-topbar-title">{current?.label || 'Bookfolio'}</h2>
          </div>

          <div className="admin-userchip" title={user?.email}>
            <span className="admin-userchip-name">{user?.username}</span>
            <span className="admin-avatar">{getInitial()}</span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;