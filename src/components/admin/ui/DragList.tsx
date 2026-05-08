'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';

interface DragListItem {
  id: string;
}

interface Props<T extends DragListItem> {
  items: T[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export default function DragList<T extends DragListItem>({
  items,
  onMoveUp,
  onMoveDown,
  renderItem,
}: Props<T>) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={item.id} className="flex items-start gap-2">
          <div className="flex flex-col gap-0.5 pt-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Mover para cima"
            >
              <ChevronUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={index === items.length - 1}
              className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Mover para baixo"
            >
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="flex-1 min-w-0">{renderItem(item, index)}</div>
        </li>
      ))}
    </ul>
  );
}
