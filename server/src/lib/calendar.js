import { clockToMinutes, datesInRange } from "./dates.js";

function activityLabel(item) {
  return item?.customName || item?.activity?.name || item?.name || "Activity";
}

function sortActivities(left, right) {
  const leftTime = clockToMinutes(left.startTime);
  const rightTime = clockToMinutes(right.startTime);
  if (leftTime == null && rightTime == null) {
    return (left.position ?? 0) - (right.position ?? 0);
  }
  if (leftTime == null) {
    return 1;
  }
  if (rightTime == null) {
    return -1;
  }
  return leftTime - rightTime || (left.position ?? 0) - (right.position ?? 0);
}

export function findScheduleConflicts(activities = []) {
  const timed = activities.filter((item) => clockToMinutes(item.startTime) != null);
  const conflicts = [];

  for (let i = 0; i < timed.length; i += 1) {
    const current = timed[i];
    const start = clockToMinutes(current.startTime);
    const end = clockToMinutes(current.endTime) ?? start;
    for (let j = i + 1; j < timed.length; j += 1) {
      const other = timed[j];
      const otherStart = clockToMinutes(other.startTime);
      const otherEnd = clockToMinutes(other.endTime) ?? otherStart;
      if (start < otherEnd && otherStart < end) {
        conflicts.push({
          left: current,
          right: other,
          message: `${activityLabel(current)} overlaps with ${activityLabel(other)}.`,
        });
      }
    }
  }

  return conflicts;
}

export function collectUnscheduled(trip) {
  const start = trip?.startDate;
  const end = trip?.endDate;
  const items = [];
  for (const stop of trip?.stops || []) {
    for (const activity of stop.activities || []) {
      const date = activity.scheduledDate;
      if (!date || (start && date < start) || (end && date > end)) {
        items.push({ stop, activity });
      }
    }
  }
  return items;
}

/**
 * Same day grouping rules as client/src/lib/calendar.js (buildCalendar).
 * Server analysis must stay aligned with the trip calendar UI.
 */
export function buildCalendar(trip) {
  const days = datesInRange(trip.startDate, trip.endDate).map((date) => {
    const stops = (trip.stops || [])
      .filter((stop) => stop.startDate <= date && stop.endDate >= date)
      .map((stop) => ({
        ...stop,
        activities: (stop.activities || [])
          .filter((activity) => activity.scheduledDate === date)
          .slice()
          .sort(sortActivities),
      }));

    const activities = stops.flatMap((stop) =>
      stop.activities.map((activity) => ({ ...activity, stop })),
    );

    return {
      date,
      stops,
      activities,
      conflicts: findScheduleConflicts(activities),
    };
  });

  return {
    trip: {
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      currency: trip.currency,
    },
    days,
    unscheduled: collectUnscheduled(trip),
  };
}

export function activityLabelFromItem(item) {
  return activityLabel(item);
}
