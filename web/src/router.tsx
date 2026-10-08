import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { PrivateLayout } from './layouts/PrivateLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Home from './pages/Home';

// Code-splitting por ruta: el bundle de la landing no carga hls.js ni el área privada
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Videos = lazy(() => import('./pages/Videos'));
const Profile = lazy(() => import('./pages/Profile'));
const Membership = lazy(() => import('./pages/Membership'));
const Admin = lazy(() => import('./pages/Admin'));

export const router = createBrowserRouter([
  // ---- Rutas públicas ----
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/registro', element: <Register /> },
    ],
  },
  // ---- Área privada (requiere login; videos/dashboard requieren membresía o admin) ----
  {
    element: (
      <ProtectedRoute requireMembership={false}>
        <PrivateLayout />
      </ProtectedRoute>
    ),
    children: [
      // Membresía y perfil: accesibles con solo login (para poder suscribirse)
      { path: '/membresia', element: <Membership /> },
      { path: '/perfil', element: <Profile /> },
    ],
  },
  {
    element: (
      <ProtectedRoute requireMembership>
        <PrivateLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/videos', element: <Videos /> },
    ],
  },
  // ---- Admin ----
  {
    element: (
      <ProtectedRoute requireMembership={false}>
        <PrivateLayout />
      </ProtectedRoute>
    ),
    children: [{ path: '/admin', element: <Admin /> }], // Admin.tsx valida is_admin internamente + RLS en BD
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
