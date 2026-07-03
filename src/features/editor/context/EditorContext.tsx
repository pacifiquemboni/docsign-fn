import { createContext, useContext } from 'react';
import type { ZoomLevel } from '@/features/documents/types';

export interface EditorContextValue {
  documentId: string;
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;
  zoom: ZoomLevel;
}

export const EditorContext = createContext<EditorContextValue>(
  null as unknown as EditorContextValue,
);

export function useEditorContext(): EditorContextValue {
  return useContext(EditorContext);
}
