
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './auth.css';

const ResetPassword = () => {
  // RÃ©cupÃ©ration des deux paramÃ¨tres prÃ©sents dans l'URL
  const { uid, token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!uid || !token) {
      setError('Lien de rÃ©initialisation incomplet ou invalide.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractÃ¨res.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/password-reset/confirm/', {
        uid,
        token,
        new_password: password,
      });

      setSuccess(true);
    } catch (err) {
      console.error('Erreur de rÃ©initialisation :', err.response?.data || err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Le lien est invalide ou a expirÃ©. Veuillez refaire la demande.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <Link to="/" className="auth-logo">Bookfolio</Link>

          <h2>Un nouveau dÃ©part.</h2>

          <p>
            Choisissez un nouveau mot de passe sÃ©curisÃ© pour reprendre
            le fil de vos lectures.
          </p>

          <blockquote>
            Â« Tourner la page, c'est aussi recommencer. Â»
            <cite>â€” Bookfolio</cite>
          </blockquote>
        </div>

        <div className="auth-visual-decor"></div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          {!success ? (
            <>
              <div className="auth-card-header">
                <h1>Nouveau mot de passe</h1>
                <p>
                  Choisissez un mot de passe solide et facile Ã  retenir.
                </p>
              </div>

              {error && (
                <div className="auth-alert error">
                  <span>âš </span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="password">Nouveau mot de passe</label>

                  <div className="password-field">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Au moins 8 caractÃ¨res"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'ðŸ™ˆ' : 'ðŸ‘'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirmer le mot de passe
                  </label>

                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner"></span>
                  ) : (
                    'RÃ©initialiser le mot de passe'
                  )}
                </button>
              </form>

              <p className="auth-switch">
                <Link to="/login">Retour Ã  la connexion</Link>
              </p>
            </>
          ) : (
            <div className="auth-success-state">
              <div className="success-icon">âœ…</div>

              <h1>Mot de passe modifiÃ© !</h1>

              <p>
                Votre mot de passe a Ã©tÃ© rÃ©initialisÃ© avec succÃ¨s.
                Vous allez Ãªtre redirigÃ© vers la page de connexion...
              </p>

              <Link to="/login" className="auth-submit as-link">
                Se connecter maintenant
              </Link>
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

export default ResetPassword;


