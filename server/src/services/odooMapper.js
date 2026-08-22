function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function money(amount, currency) {
  if (amount === null || amount === undefined || amount === "") {
    return "—";
  }
  return `${currency} ${amount}`;
}

function activityName(item) {
  return item.customName || item.activity?.name || "Activity";
}

function cityLabel(city) {
  if (!city) {
    return "Unknown city";
  }
  return [city.name, city.region, city.country].filter(Boolean).join(", ");
}

export function mapTripToExportPayload(trip) {
  const destinations = (trip.stops || []).map((stop) => ({
    position: stop.position,
    city: cityLabel(stop.city),
    country: stop.city?.country || null,
    startDate: stop.startDate,
    endDate: stop.endDate,
    notes: stop.notes || null,
    activities: (stop.activities || []).map((item) => ({
      name: activityName(item),
      scheduledDate: item.scheduledDate,
      startTime: item.startTime,
      durationMin: item.durationMin,
      cost: item.cost,
    })),
  }));

  const expenses = (trip.expenses || []).map((expense) => ({
    description: expense.description || expense.label,
    category: expense.category,
    amount: expense.amount,
    expenseDate: expense.expenseDate || expense.incurredOn,
  }));

  return {
    source: "GlobeTrotter",
    trip: {
      name: trip.name,
      description: trip.description || "",
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budgetLimit,
      currency: trip.currency,
    },
    destinations,
    expenses,
  };
}

export function tripDescriptionHtml(trip) {
  const payload = mapTripToExportPayload(trip);
  const rows = [];

  rows.push(`<h1>${escapeHtml(payload.trip.name)}</h1>`);
  rows.push(`<p>${escapeHtml(payload.trip.description || "No description")}</p>`);
  rows.push(
    `<p><strong>Dates:</strong> ${escapeHtml(payload.trip.startDate)} → ${escapeHtml(payload.trip.endDate)}</p>`,
  );
  rows.push(
    `<p><strong>Budget:</strong> ${escapeHtml(money(payload.trip.budget, payload.trip.currency))}</p>`,
  );

  rows.push("<h2>Destinations</h2>");
  if (payload.destinations.length === 0) {
    rows.push("<p>No destinations yet.</p>");
  } else {
    rows.push("<ol>");
    for (const stop of payload.destinations) {
      rows.push("<li>");
      rows.push(
        `<p><strong>${escapeHtml(stop.city)}</strong> (${escapeHtml(stop.startDate)} → ${escapeHtml(stop.endDate)})</p>`,
      );
      if (stop.notes) {
        rows.push(`<p>${escapeHtml(stop.notes)}</p>`);
      }
      if (stop.activities.length) {
        rows.push("<ul>");
        for (const activity of stop.activities) {
          rows.push(
            `<li>${escapeHtml(activity.name)} — ${escapeHtml(activity.scheduledDate || "unscheduled")}${activity.startTime ? ` ${escapeHtml(activity.startTime)}` : ""} (${escapeHtml(money(activity.cost, payload.trip.currency))})</li>`,
          );
        }
        rows.push("</ul>");
      }
      rows.push("</li>");
    }
    rows.push("</ol>");
  }

  rows.push("<h2>Expenses</h2>");
  if (payload.expenses.length === 0) {
    rows.push("<p>No expenses recorded.</p>");
  } else {
    rows.push("<ul>");
    for (const expense of payload.expenses) {
      rows.push(
        `<li>${escapeHtml(expense.description)} (${escapeHtml(expense.category)}) — ${escapeHtml(money(expense.amount, payload.trip.currency))} on ${escapeHtml(expense.expenseDate || "n/a")}</li>`,
      );
    }
    rows.push("</ul>");
  }

  return rows.join("\n");
}

export function tripDescriptionText(trip) {
  return tripDescriptionHtml(trip)
    .replace(/<h1>/g, "")
    .replace(/<\/h1>/g, "\n")
    .replace(/<h2>/g, "\n")
    .replace(/<\/h2>/g, "\n")
    .replace(/<li>/g, "- ")
    .replace(/<\/li>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Standard Odoo models (no custom GlobeTrotter modules required).
 *
 * 1. project.project — Project app (name, description HTML, date_start, date)
 * 2. calendar.event — Calendar app (name, start, stop, description)
 * 3. res.partner — always available in base (name, comment)
 */
export const ODOO_MODEL_STRATEGIES = [
  {
    model: "project.project",
    values(trip) {
      return {
        name: trip.name,
        description: tripDescriptionHtml(trip),
        date_start: trip.startDate,
        date: trip.endDate,
      };
    },
    fallbackValues(trip) {
      return {
        name: trip.name,
        description: tripDescriptionHtml(trip),
      };
    },
  },
  {
    model: "calendar.event",
    values(trip) {
      return {
        name: trip.name,
        start: `${trip.startDate} 09:00:00`,
        stop: `${trip.endDate} 18:00:00`,
        description: tripDescriptionText(trip),
      };
    },
    fallbackValues(trip) {
      return {
        name: trip.name,
        start: `${trip.startDate} 09:00:00`,
        stop: `${trip.endDate} 18:00:00`,
      };
    },
  },
  {
    model: "res.partner",
    values(trip) {
      return {
        name: `GlobeTrotter: ${trip.name}`,
        comment: tripDescriptionText(trip),
        is_company: false,
      };
    },
    fallbackValues(trip) {
      return {
        name: `GlobeTrotter: ${trip.name}`,
        comment: tripDescriptionText(trip),
      };
    },
  },
];
