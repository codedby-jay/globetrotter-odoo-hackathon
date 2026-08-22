import { TriangleAlert } from "lucide-react";

export default function ScheduleConflict({ conflicts }) {
  if (!conflicts?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-coral/30 bg-coral/5 px-4 py-3 text-sm">
      <p className="flex items-center gap-2 font-medium text-coral">
        <TriangleAlert size={16} />
        Schedule conflict
      </p>
      <ul className="mt-2 space-y-1 text-coral">
        {conflicts.map((conflict, index) => (
          <li key={`${conflict.left.id}-${conflict.right.id}-${index}`}>
            {conflict.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
