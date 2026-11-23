
import {
  createContext,
  useState,
  useEffect,
  useContext
} from 'react';

import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Supprimer toutes les informations de session
  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Récupérer le profil auprès de Django
  const fetchUser = async (accessToken) => {
    const response = await api.get('/auth/me/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  };

  // Vérification de la session au chargement
  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        let token = localStorage.getItem('token');

        const refresh = localStorage.getItem('refresh');

        if (!token) {
          clearSession();
          return;
        }

        let currentUser;

        try {
          currentUser = await fetchUser(token);
        } catch (error) {
          // Si le token a expiré, essayer de le renouveler
          if (error.response?.status !== 401 || !refresh) {
            throw error;
          }

          const response = await api.post('/auth/token/refresh/', {
            refresh,
          });

          token = response.data.access;

          localStorage.setItem('token', token);

          currentUser = await fetchUser(token);
        }

        if (active) {
          localStorage.setItem('user', JSON.stringify(currentUser));
          setUser(currentUser);
        }

      } catch (error) {
        console.error('Session invalide :', error.response?.data || error);

        if (active) {
          clearSession();
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  // Connexion
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);

      const currentUser = await fetchUser(access);

      localStorage.setItem('user', JSON.stringify(currentUser));
      setUser(currentUser);

      console.log('Utilisateur connecté :', currentUser);
      console.log('Rôle :', currentUser.role);

      if (currentUser.is_superuser || currentUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (currentUser.role === 'author') {
        navigate('/auteur', { replace: true });
      } else if (currentUser.role === 'reader') {
        navigate('/lecteur', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

      return { success: true };

    } catch (error) {
      console.error('Erreur de connexion :', error.response?.data);

      clearSession();

      const data = error.response?.data;
      let message = 'Identifiants incorrects';

      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstError = data[firstKey];

        if (firstError) {
          message = Array.isArray(firstError)
            ? firstError[0]
            : firstError;
        }
      }

      return { success: false, message };
    }
  };

  // Inscription
  const register = async (username, email, password, role) => {
    try {
      const normalizedRole =
        role === 'auteur' ? 'author' :
        role === 'lecteur' ? 'reader' :
        role;

      const response = await api.post('/auth/register/', {
        username,
        email,
        password,
        role: normalizedRole,
      });

      console.log('Inscription réussie :', response.data);

      navigate('/login', { replace: true });

      return { success: true };

    } catch (error) {
      console.error('Erreur inscription :', error.response?.data);

      const data = error.response?.data;
      let message = "Erreur d'inscription";

      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstError = data[firstKey];

        if (firstError) {
          message = Array.isArray(firstError)
            ? firstError[0]
            : firstError;
        }
      }

      return { success: false, message };
    }
  };

  // Déconnexion
  const logout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
