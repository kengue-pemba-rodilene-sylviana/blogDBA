
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import PublicLayout from './components/PublicLayout';
import ProtectedRoute from './components/protectedroute';

// Pages publiques
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminArticles from './pages/admin/AdminArticles';
import ArticleForm from './pages/admin/ArticleForm';
import AdminComments from './pages/admin/AdminComments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';

// Lecteur
import UserLayout from './pages/Lecteur/UserLayout';
import UserDashboard from './pages/Lecteur/UserDashboard';
import UserProfile from './pages/Lecteur/UserProfile';
import UserComments from './pages/Lecteur/UserComments';
import UserPassword from './pages/Lecteur/UserPassword';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ====== PAGES PUBLIQUES (avec Navbar) ====== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* ====== ESPACE LECTEUR (avec Navbar) ====== */}
          <Route element={<ProtectedRoute allowedRoles={['reader', 'admin']} />}>
            <Route path="/lecteur" element={<UserLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="comments" element={<UserComments />} />
              <Route path="articles" element={<Articles />} />
              <Route path="articles/:id" element={<ArticleDetail />} />
              <Route path="password" element={<UserPassword />} />
            </Route>
          </Route>

          {/* ====== ESPACE ADMIN (sans Navbar) ====== */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="articles/new" element={<ArticleForm />} />
              <Route path="categories" element={<AdminCategories />} /> 
              <Route path="articles/:id/edit" element={<ArticleForm />} />
              <Route path="comments" element={<AdminComments />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;