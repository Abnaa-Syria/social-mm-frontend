import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

const cardKey = (id) => `card-${id}`;
const cardIdFromKey = (key) => parseInt(String(key).replace('card-', ''), 10);

const buildItemsFromColumns = (columns) => {
  const items = {};
  columns.forEach((column) => {
    items[column.id] = (column.cards || []).map((card) => cardKey(card.id));
  });
  return items;
};

const buildCardsMap = (columns) => {
  const map = {};
  columns.forEach((column) => {
    (column.cards || []).forEach((card) => {
      map[cardKey(card.id)] = card;
    });
  });
  return map;
};

const findColumnForCard = (items, cardKeyId) => {
  for (const [columnId, cardIds] of Object.entries(items)) {
    if (cardIds.includes(cardKeyId)) return columnId;
  }
  return null;
};

export default function KanbanBoard({
  columns = [],
  renderCard,
  onAddCard,
  onColumnsUpdate,
  draggable = false,
  emptyMessage = 'لا توجد بطاقات',
}) {
  const [items, setItems] = useState(() => buildItemsFromColumns(columns));
  const [activeKey, setActiveKey] = useState(null);

  const cardsMap = useMemo(() => buildCardsMap(columns), [columns]);

  useEffect(() => {
    setItems(buildItemsFromColumns(columns));
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleDragStart = (event) => {
    setActiveKey(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || !draggable) return;

    const activeId = active.id;
    const overId = over.id;
    const activeColumn = findColumnForCard(items, activeId);
    const overColumn = findColumnForCard(items, overId) || over.data.current?.columnId;

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setItems((prev) => {
      const activeItems = [...prev[activeColumn]];
      const overItems = [...(prev[overColumn] || [])];
      const activeIndex = activeItems.indexOf(activeId);
      if (activeIndex === -1) return prev;

      activeItems.splice(activeIndex, 1);

      let overIndex = overItems.length;
      if (over.data.current?.type === 'card') {
        const idx = overItems.indexOf(overId);
        if (idx >= 0) overIndex = idx;
      }

      overItems.splice(overIndex, 0, activeId);

      return { ...prev, [activeColumn]: activeItems, [overColumn]: overItems };
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveKey(null);

    if (!over || !draggable || !onColumnsUpdate) return;

    const activeId = active.id;
    const startColumn = active.data.current?.columnId;
    const overColumn = findColumnForCard(items, over.id) || over.data.current?.columnId;

    if (!startColumn || !overColumn) return;

    const startList = [...(items[startColumn] || [])];
    const oldIndex = startList.indexOf(activeId);
    if (oldIndex === -1) return;

    let nextItems = { ...items };

    if (startColumn === overColumn) {
      let newIndex = startList.length - 1;
      if (over.data.current?.type === 'card') {
        const idx = startList.indexOf(over.id);
        if (idx >= 0) newIndex = idx;
      }
      if (oldIndex === newIndex) return;

      const reordered = arrayMove(startList, oldIndex, newIndex);
      nextItems = { ...items, [startColumn]: reordered };
      setItems(nextItems);
      onColumnsUpdate([{
        columnId: startColumn,
        orderedIds: reordered.map((key) => cardIdFromKey(key)),
      }]);
      return;
    }

    const sourceList = startList.filter((key) => key !== activeId);
    const targetList = [...(items[overColumn] || []).filter((key) => key !== activeId)];

    let insertIndex = targetList.length;
    if (over.data.current?.type === 'card') {
      const idx = targetList.indexOf(over.id);
      insertIndex = idx >= 0 ? idx : targetList.length;
    }
    targetList.splice(insertIndex, 0, activeId);

    nextItems = { ...items, [startColumn]: sourceList, [overColumn]: targetList };
    setItems(nextItems);

    const updates = [];
    if (sourceList.length) {
      updates.push({ columnId: startColumn, orderedIds: sourceList.map((key) => cardIdFromKey(key)) });
    }
    updates.push({ columnId: overColumn, orderedIds: targetList.map((key) => cardIdFromKey(key)) });
    onColumnsUpdate(updates);
  };

  const activeCard = activeKey ? cardsMap[activeKey] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-280px)]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            columnId={column.id}
            title={column.label}
            count={items[column.id]?.length || 0}
            onAdd={onAddCard ? () => onAddCard(column.id) : undefined}
            droppable={draggable}
          >
            <SortableContext
              items={items[column.id] || []}
              strategy={verticalListSortingStrategy}
            >
              {(items[column.id] || []).length ? (
                (items[column.id] || []).map((key) => (
                  <KanbanCard
                    key={key}
                    card={cardsMap[key]}
                    columnId={column.id}
                    draggable={draggable}
                  >
                    {renderCard(cardsMap[key], column)}
                  </KanbanCard>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-6">{emptyMessage}</p>
              )}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeCard ? (
          <div className="rotate-1 shadow-xl w-72">
            {renderCard(activeCard, { id: findColumnForCard(items, activeKey) })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
