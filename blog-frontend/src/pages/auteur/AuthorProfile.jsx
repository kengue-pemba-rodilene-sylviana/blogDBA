import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import AuthorShell from './AuthorShell';
import './AuthorDashboard.css';

export default function AuthorProfile() {
  const { user } = useAuth();

  return (
    <AuthorShell>
      <div className="author-pagehead">
        <div>
          <span className="author-eyebrow">Compte</span>
          <h1>Mon profil <span className="author-accent">auteur</span></h1>
        </div>
      </div>

      <div className="author-profile-card">
        <h2>Informations personnelles</h2>

        <p><strong>Nom d'utilisateur</strong> {user?.username || 'Non renseigné'}</p>
        <p><strong>Prénom</strong> {user?.first_name || 'Non renseigné'}</p>
        <p><strong>Nom</strong> {user?.last_name || 'Non renseigné'}</p>
        <p><strong>Email</strong> {user?.email || 'Non renseigné'}</p>
        <p><strong>Rôle</strong> Auteur</p>

        <Link to="/auteur">Retour au tableau de bord</Link>
      </div>
    </AuthorShell>
  );
}
