import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconBook, IconHome, IconPlus, IconFile, IconEdit, IconClock,
  IconChart, IconChat, IconUser, IconLogout, IconClose,
} from './AuthorIcons';
import './AuthorDashboard.css';

const NAV_MAIN = [
  { to: '/auteur', label: 'Tableau de bord', Icon: IconHome, end: true },
  { to: '/auteur/nouvel-article', label: 'Nouvel article', Icon: IconPlus },
  { to: '/auteur/articles', label: 'Mes articles', Icon: IconFile },
  { to: '/auteur/brouillons', label: 'Brouillons', Icon: IconEdit },
  { to: '/auteur/en-attente', label: 'En attente', Icon: IconClock },
  { to: '/auteur/statistiques', label: 'Statistiques', Icon: IconChart },
  { to: '/auteur/commentaires', label: 'Commentaires', Icon: IconChat },
];

const NAV_ACCOUNT = [
  { to: '/auteur/profil', label: 'Mon profil', Icon: IconUser },
];

const ALL_ITEMS = [...NAV_MAIN, ...NAV_ACCOUNT];

/* Cadre commun de l'espace auteur : barre d'icônes, topbar, menu burger */
export default function AuthorShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erreur de déconnexion :', error);
      navigate('/login', { replace: true });
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const initial = (user?.username || 'A').charAt(0).toUpperCase();

  // Titre de la page courante (le chemin le plus précis gagne)
  const current = [...ALL_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) =>
      i.to === '/auteur'
        ? location.pathname === '/auteur'
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
      className="author-nav-link"
      data-label={label}
      aria-label={label}
      onClick={closeMenu}
    >
      <Icon size={22} />
      <span className="author-nav-label">{label}</span>
    </NavLink>
  );

  return (
    <div className="author-layout">
      <div
        className={`author-overlay ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside className={`author-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="author-brand">
          <span className="author-brand-icon"><IconBook size={22} /></span>
          <span className="author-brand-text">Bookfolio</span>
          <span className="author-badge">Auteur</span>
          <button
            type="button"
            className="author-sidebar-close"
            onClick={closeMenu}
            aria-label="Fermer le menu"
          >
            <IconClose size={18} />
          </button>
        </div>

        <nav className="author-nav" aria-label="Navigation principale">
          {NAV_MAIN.map(renderLink)}
          <div className="author-nav-separator" />
          {NAV_ACCOUNT.map(renderLink)}
        </nav>

        <div className="author-sidebar-footer">
          <div className="author-user">
            <span className="author-avatar">{initial}</span>
            <div>
              <strong>{user?.username || 'Auteur'}</strong>
              <small>Compte auteur</small>
            </div>
          </div>
          <button
            type="button"
            className="author-nav-link author-logout"
            data-label="Déconnexion"
            aria-label="Déconnexion"
            onClick={handleLogout}
          >
            <IconLogout size={22} />
            <span className="author-nav-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="author-main">
        <header className="author-topbar">
          <div className="author-topbar-left">
            <button
              type="button"
              className="author-burger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
            <h2 className="author-topbar-title">{current?.label || 'Espace auteur'}</h2>
          </div>

          <div className="author-userchip">
            <span className="author-userchip-name">{user?.username || 'Auteur'}</span>
            <span className="author-avatar">{initial}</span>
          </div>
        </header>

        <section className="author-content">{children}</section>
      </main>
    </div>
  );
}
