import { Outlet } from 'react-router-dom';

/**
 * Full-screen layout for the document editor.
 * Deliberately no nav sidebar — the editor owns the entire viewport.
 */
export function EditorLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      <Outlet />
    </div>
  );
}
