import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/password-reset/', { email });
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Impossible d'envoyer l'email. VÃ©rifiez votre adresse et rÃ©essayez."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ---- Panneau visuel (gauche) ---- */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          <Link to="/" className="auth-logo"> Bookfolio</Link>
          <h2>Pas de panique.</h2>
          <p>
            Cela arrive Ã  tout le monde d'oublier un mot de passe.
            Nous allons vous aider Ã  retrouver l'accÃ¨s Ã  votre bibliothÃ¨que.
          </p>
          <blockquote>
            Â« Chaque lecteur a le droit Ã  une seconde chance. Â»
            <cite>â€” Bookfolio</cite>
          </blockquote>
        </div>
        <div className="auth-visual-decor"></div>
      </div>

      {/* ---- Panneau formulaire (droite) ---- */}
      <div className="auth-form-panel">
        <div className="auth-card">
          {!sent ? (
            <>
              <div className="auth-card-header">
                <h1>Mot de passe oubliÃ© ?</h1>
                <p>
                  Entrez l'adresse email associÃ©e Ã  votre compte.
                  Nous vous enverrons un lien pour rÃ©initialiser votre mot de passe.
                </p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <span>âš </span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Adresse email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? <span className="spinner"></span> : 'Envoyer le lien'}
                </button>
              </form>

              <div className="auth-divider">
                <span>ou</span>
              </div>

              <p className="auth-switch">
                Vous vous en souvenez ?{' '}
                <Link to="/login">Retour Ã  la connexion</Link>
              </p>
            </>
          ) : (
            /* ---- Ã‰tat "email envoyÃ©" ---- */
            <div className="auth-success-state">
              <div className="success-icon">âœ‰ï¸</div>
              <h1>Email envoyÃ© !</h1>
              <p>
                Si un compte est associÃ© Ã  <strong>{email}</strong>,
                vous recevrez un lien de rÃ©initialisation dans quelques minutes.
              </p>
              <p className="success-hint">
                Pensez Ã  vÃ©rifier votre dossier Â« spam Â» ou Â« courrier indÃ©sirable Â».
              </p>

              <Link to="/login" className="auth-submit as-link">
                Retour Ã  la connexion
              </Link>

              <button
                type="button"
                className="resend-btn"
                onClick={() => setSent(false)}
              >
                Renvoyer l'email
              </button>
            </div>
          )}
        </div>

        <p className="auth-footer-note">
          Â© 2026 Bookfolio â€” Tous droits rÃ©servÃ©s
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;


