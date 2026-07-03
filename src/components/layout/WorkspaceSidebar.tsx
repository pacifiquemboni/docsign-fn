import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, FileText, Key, LayoutDashboard, LogOut,
  Paintbrush, PenLine, Send, Settings, Shield, Upload, Users, X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { fullName } from '@/features/auth/types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  end?: boolean;
}

const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard',  to: '/dashboard',  icon: <LayoutDashboard className="h-4 w-4" />, end: true },
  { label: 'Documents',  to: '/documents',  icon: <FileText className="h-4 w-4" /> },
  { label: 'Sessions',   to: '/sessions',   icon: <Send className="h-4 w-4" /> },
  { label: 'Upload',     to: '/documents/upload', icon: <Upload className="h-4 w-4" /> },
];

const PEOPLE_NAV: NavItem[] = [
  { label: 'Users',   to: '/users',   icon: <Users className="h-4 w-4" /> },
  { label: 'Roles',   to: '/roles',   icon: <Shield className="h-4 w-4" /> },
];

const SETTINGS_NAV: NavItem[] = [
  { label: 'API Keys',  to: '/api-keys',  icon: <Key className="h-4 w-4" /> },
  { label: 'Branding',  to: '/branding',  icon: <Paintbrush className="h-4 w-4" /> },
  { label: 'Workspace', to: '/workspace', icon: <Settings className="h-4 w-4" /> },
];

interface WorkspaceSidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function WorkspaceSidebar({ open, collapsed, onClose, onToggleCollapse }: WorkspaceSidebarProps) {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 transition-all duration-200 ease-in-out',
          'lg:relative',
          collapsed ? 'w-16' : 'w-60',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo + collapse toggle */}
        <div className="flex h-16 items-center justify-between px-4">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
                <PenLine className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {organization?.name ?? 'DocSign'}
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <PenLine className="h-4 w-4 text-white" />
            </div>
          )}

          <button
            onClick={collapsed ? onToggleCollapse : onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden h-6 w-6 items-center justify-center rounded text-slate-400 hover:text-white lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
          <NavGroup label="Main" collapsed={collapsed} items={MAIN_NAV} onClick={onClose} />
          <NavGroup label="People" collapsed={collapsed} items={PEOPLE_NAV} onClick={onClose} />
          <NavGroup label="Settings" collapsed={collapsed} items={SETTINGS_NAV} onClick={onClose} />
        </nav>

        {/* User footer */}
        <div className={cn('border-t border-slate-700/50 p-2', collapsed ? 'flex justify-center' : '')}>
          {!collapsed && user && (
            <div className="mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                {(user.first_name?.[0] ?? user.email[0]).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{fullName(user)}</p>
                <p className="truncate text-[10px] text-slate-400">{user.role ?? 'Member'}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-xs',
              collapsed ? 'h-9 w-9 justify-center' : 'w-full px-2 py-1.5',
            )}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>
    </>
  );
}

function NavGroup({
  label, items, collapsed, onClick,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onClick}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
                  collapsed ? 'h-9 w-full justify-center' : 'px-3 py-2',
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                )
              }
            >
              {item.icon}
              {!collapsed && item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
