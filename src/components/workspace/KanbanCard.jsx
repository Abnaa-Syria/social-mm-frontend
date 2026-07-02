import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanDragHandleContext } from './KanbanDragHandleContext';

export default function KanbanCard({ card, columnId, draggable, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${card.id}`,
    data: { type: 'card', cardId: card.id, columnId },
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const dragHandle = draggable
    ? { ref: setActivatorNodeRef, onPointerDown: listeners.onPointerDown, onKeyDown: listeners.onKeyDown }
    : null;

  return (
    <KanbanDragHandleContext.Provider value={dragHandle}>
      <div ref={setNodeRef} style={style} className={isDragging ? 'relative z-10' : ''}>
        {children}
      </div>
    </KanbanDragHandleContext.Provider>
  );
}
