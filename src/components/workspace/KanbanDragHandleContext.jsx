import { createContext, useContext } from 'react';

export const KanbanDragHandleContext = createContext(null);

export function useKanbanDragHandle() {
  return useContext(KanbanDragHandleContext);
}
