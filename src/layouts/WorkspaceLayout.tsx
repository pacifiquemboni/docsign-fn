import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, User } from 'lucide-react';
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { fullName } from '@/features/auth/types';

export function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, organization } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <WorkspaceSidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 sm:flex">
              <Search className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-sm text-gray-400">Search…</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {organization && (
              <span className="hidden text-xs font-medium text-gray-500 lg:block">
                {organization.name}
              </span>
            )}

            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold hover:bg-indigo-200 transition-colors"
              aria-label="Profile"
              title={user ? fullName(user) : 'Profile'}
            >
              {user ? (user.first_name?.[0] ?? user.email[0]).toUpperCase() : <User className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
