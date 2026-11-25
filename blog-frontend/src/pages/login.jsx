import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './auth.css';

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ---- Panneau gauche (visuel) ---- */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          <Link to="/" className="auth-logo"> Bookfolio</Link>
          <h2>Bon retour parmi nous.</h2>
          <p>
            Retrouvez vos articles, vos lectures et votre communautÃ©.
            Chaque page tournÃ©e est un nouveau voyage.
          </p>
          <blockquote>
            Â« Un livre est un rÃªve que vous tenez dans vos mains. Â»
            <cite>â€” Neil Gaiman</cite>
          </blockquote>
        </div>
        <div className="auth-visual-decor"></div>
      </div>

      {/* ---- Panneau droit (formulaire) ---- */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Connexion</h1>
            <p>AccÃ©dez Ã  votre espace personnel</p>
          </div>

          {error && (
            <div className="auth-alert error">
              <span>âš </span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                type="text"
                placeholder="votre_pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Mot de passe</label>
                <Link to="/forgot-password" className="forgot-link">Mot de passe oubliÃ© ?</Link>
              </div>
              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Afficher le mot de passe"
                >
                  {showPassword ? 'ðŸ™ˆ' : 'ðŸ‘'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Se connecter'}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <p className="auth-switch">
            Pas encore de compte ?{' '}
            <Link to="/register">CrÃ©er un compte</Link>
          </p>
        </div>

        <p className="auth-footer-note">
          Â© 2026 Bookfolio â€” Tous droits rÃ©servÃ©s
        </p>
      </div>
    </div>
  );
};

export default Login;

