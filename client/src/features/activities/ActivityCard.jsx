import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import {
  activityLabel,
  categoryLabel,
  formatDate,
  formatDuration,
  formatMoney,
} from "../../lib/dates.js";
import Button from "../../ui/Button.jsx";

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
  const duration = formatDuration(item.durationMin);
  const notes = item.notes || item.customDescription;

  return (
    <article className="rounded-xl border border-line bg-cream/70 px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold">
            <span className="mr-3 font-medium text-teal">{time}</span>
            {name}
          </p>
          <p className="mt-1 text-sm text-muted">
            {category}
            {item.scheduledDate ? ` · ${formatDate(item.scheduledDate)}` : ""}
            {duration ? ` · ${duration}` : ""}
          </p>
          <p className="mt-1 text-sm font-medium">{formatMoney(item.cost ?? 0, currency)}</p>
          {notes ? <p className="mt-1 text-sm text-muted">{notes}</p> : null}
        </div>
        {readOnly ? null : (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={onMoveUp} disabled={isFirst || reordering}>
              <ArrowUp size={12} />
              Up
            </Button>
            <Button variant="secondary" size="sm" onClick={onMoveDown} disabled={isLast || reordering}>
              <ArrowDown size={12} />
              Down
            </Button>
            <Button variant="secondary" size="sm" onClick={onEdit}>
              <Pencil size={12} />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete}>
              <Trash2 size={12} />
              Delete
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
