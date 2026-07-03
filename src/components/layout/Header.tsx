import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/documents': 'Documents',
  '/documents/upload': 'Upload Document',
  '/settings': 'Settings',
};

function usePageTitle() {
  const { pathname } = useLocation();
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/documents/') && pathname !== '/documents/upload') {
    return 'Document Details';
  }
  return 'DocSign';
}

export function Header({ onMenuClick }: HeaderProps) {
  const title = usePageTitle();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>

      {/* User avatar placeholder */}
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white"
          aria-label="User avatar"
        >
          U
        </div>
      </div>
    </header>
  );
}
