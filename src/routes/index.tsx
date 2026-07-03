import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { WorkspaceLayout } from '@/layouts/WorkspaceLayout';
import { EditorLayout } from '@/layouts/EditorLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PageSpinner } from '@/components/common/LoadingSpinner';

// ── Auth pages ────────────────────────────────────────────────────────────────
const LoginPage             = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage          = lazy(() => import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage    = lazy(() => import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const AcceptInvitationPage  = lazy(() => import('@/features/auth/pages/AcceptInvitationPage').then((m) => ({ default: m.AcceptInvitationPage })));

// ── Workspace pages ───────────────────────────────────────────────────────────
const DashboardPage         = lazy(() => import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const DocumentsPage         = lazy(() => import('@/features/documents/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const DocumentUploadPage    = lazy(() => import('@/features/documents/pages/DocumentUploadPage').then((m) => ({ default: m.DocumentUploadPage })));
const DocumentDetailPage    = lazy(() => import('@/features/documents/pages/DocumentDetailPage').then((m) => ({ default: m.DocumentDetailPage })));
const SessionDashboard      = lazy(() => import('@/features/sessions/pages/SessionDashboard').then((m) => ({ default: m.SessionDashboard })));
const CreateSessionPage     = lazy(() => import('@/features/sessions/pages/CreateSessionPage').then((m) => ({ default: m.CreateSessionPage })));
const SessionDetailsPage    = lazy(() => import('@/features/sessions/pages/SessionDetailsPage').then((m) => ({ default: m.SessionDetailsPage })));
const UsersPage             = lazy(() => import('@/features/users/pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const RolesPage             = lazy(() => import('@/features/roles/pages/RolesPage').then((m) => ({ default: m.RolesPage })));
const ApiKeysPage           = lazy(() => import('@/features/apiKeys/pages/ApiKeysPage').then((m) => ({ default: m.ApiKeysPage })));
const WorkspaceSettingsPage = lazy(() => import('@/features/workspace/pages/WorkspaceSettingsPage').then((m) => ({ default: m.WorkspaceSettingsPage })));
const BrandingPage          = lazy(() => import('@/features/branding/pages/BrandingPage').then((m) => ({ default: m.BrandingPage })));
const ProfilePage           = lazy(() => import('@/features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

// ── Full-screen (no workspace shell) ─────────────────────────────────────────
const DocumentEditorPage    = lazy(() => import('@/features/editor/pages/DocumentEditorPage').then((m) => ({ default: m.DocumentEditorPage })));
const SigningPage            = lazy(() => import('@/features/signing/pages/SigningPage').then((m) => ({ default: m.SigningPage })));
const RecipientSigningPage  = lazy(() => import('@/features/signing/pages/RecipientSigningPage').then((m) => ({ default: m.RecipientSigningPage })));

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Wrap>{children}</Wrap>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  // ── Auth routes (redirect if already logged in) ───────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',            element: <Wrap><LoginPage /></Wrap> },
      { path: '/register',         element: <Wrap><RegisterPage /></Wrap> },
      { path: '/forgot-password',  element: <Wrap><ForgotPasswordPage /></Wrap> },
      { path: '/invitation/:token', element: <Wrap><AcceptInvitationPage /></Wrap> },
    ],
  },

  // ── Full-screen document editor (auth required, no workspace shell) ────────
  {
    path: '/documents/:id/edit',
    element: (
      <ProtectedRoute>
        <EditorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Wrap><DocumentEditorPage /></Wrap> },
    ],
  },

  // ── Owner signing preview ─────────────────────────────────────────────────
  {
    path: '/documents/:id/sign',
    element: <Protected><SigningPage /></Protected>,
  },

  // ── Recipient signing (token-only, no auth needed) ─────────────────────────
  {
    path: '/sign/:token',
    element: <Wrap><RecipientSigningPage /></Wrap>,
  },

  // ── Workspace (sidebar + header, auth required) ────────────────────────────
  {
    element: (
      <ProtectedRoute>
        <WorkspaceLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/',             element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard',    element: <Wrap><DashboardPage /></Wrap> },

      // Documents
      { path: '/documents',        element: <Wrap><DocumentsPage /></Wrap> },
      { path: '/documents/upload', element: <Wrap><DocumentUploadPage /></Wrap> },
      { path: '/documents/:id',    element: <Wrap><DocumentDetailPage /></Wrap> },
      { path: '/documents/:id/session', element: <Wrap><CreateSessionPage /></Wrap> },

      // Sessions
      { path: '/sessions',         element: <Wrap><SessionDashboard /></Wrap> },
      { path: '/sessions/:id',     element: <Wrap><SessionDetailsPage /></Wrap> },

      // People
      { path: '/users',       element: <Wrap><UsersPage /></Wrap> },
      { path: '/roles',       element: <Wrap><RolesPage /></Wrap> },

      // Org settings
      { path: '/api-keys',    element: <Wrap><ApiKeysPage /></Wrap> },
      { path: '/branding',    element: <Wrap><BrandingPage /></Wrap> },
      { path: '/workspace',   element: <Wrap><WorkspaceSettingsPage /></Wrap> },

      // Account
      { path: '/profile',     element: <Wrap><ProfilePage /></Wrap> },
    ],
  },
]);
