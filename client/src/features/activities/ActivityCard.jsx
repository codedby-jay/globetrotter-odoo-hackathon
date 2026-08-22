import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import {
  activityLabel,
  categoryLabel,
  formatMoney,
} from "../../lib/dates.js";

export default function ActivityCard({
  item,
  currency = "USD",
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  reordering,
  readOnly,
}) {
  const name = activityLabel(item);
  const category = categoryLabel(item.activity?.type);
  const time = item.startTime || "—";

  return (
    <article className="rounded-xl border border-sand bg-cream/60 px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold">
            <span className="mr-3 text-teal">{time}</span>
            {name}
          </p>
          <p className="mt-1 text-sm text-muted">{category}</p>
          <p className="mt-1 text-sm">{formatMoney(item.cost ?? 0, currency)}</p>
        </div>
        {readOnly ? null : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-sand bg-white px-2.5 py-1.5 text-xs hover:bg-sand disabled:opacity-40"
              onClick={onMoveUp}
              disabled={isFirst || reordering}
            >
              <ArrowUp size={12} />
              Up
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-sand bg-white px-2.5 py-1.5 text-xs hover:bg-sand disabled:opacity-40"
              onClick={onMoveDown}
              disabled={isLast || reordering}
            >
              <ArrowDown size={12} />
              Down
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-sand bg-white px-2.5 py-1.5 text-xs hover:bg-sand"
              onClick={onEdit}
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-coral hover:bg-white"
              onClick={onDelete}
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
