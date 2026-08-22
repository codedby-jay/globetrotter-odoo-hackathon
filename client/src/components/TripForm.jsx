export const inputClassName = "gt-input";

export function Field({ label, error, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-coral">{error}</span> : null}
    </label>
  );
}

export const CURRENCIES = ["USD", "EUR", "INR", "GBP", "AUD", "CAD"];

export default function TripForm({
  initialValues,
  submitLabel,
  submitting,
  formError,
  onSubmit,
}) {
  return (
    <form className="grid gap-1 md:grid-cols-2 md:gap-x-4" onSubmit={onSubmit} noValidate>
      <fieldset disabled={submitting} className="contents">
        <div className="md:col-span-2">
          <Field label="Trip name" error={initialValues.errors.name}>
            <input
              className={inputClassName}
              name="name"
              value={initialValues.values.name}
              onChange={initialValues.onChange}
              placeholder="Thailand Adventure"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Description" error={initialValues.errors.description}>
            <textarea
              className={`${inputClassName} min-h-24`}
              name="description"
              value={initialValues.values.description}
              onChange={initialValues.onChange}
              placeholder="A short note about this trip"
            />
          </Field>
        </div>
        <Field label="Start date" error={initialValues.errors.startDate}>
          <input
            className={inputClassName}
            type="date"
            name="startDate"
            value={initialValues.values.startDate}
            onChange={initialValues.onChange}
          />
        </Field>
        <Field label="End date" error={initialValues.errors.endDate}>
          <input
            className={inputClassName}
            type="date"
            name="endDate"
            value={initialValues.values.endDate}
            onChange={initialValues.onChange}
          />
        </Field>
        <Field label="Budget" error={initialValues.errors.budgetLimit}>
          <input
            className={inputClassName}
            type="number"
            name="budgetLimit"
            min="0"
            step="1"
            value={initialValues.values.budgetLimit}
            onChange={initialValues.onChange}
            placeholder="2000"
          />
        </Field>
        <Field label="Currency" error={initialValues.errors.currency}>
          <select
            className={inputClassName}
            name="currency"
            value={initialValues.values.currency}
            onChange={initialValues.onChange}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Cover image URL (optional)" error={initialValues.errors.coverPhotoUrl}>
            <input
              className={inputClassName}
              type="url"
              name="coverPhotoUrl"
              value={initialValues.values.coverPhotoUrl}
              onChange={initialValues.onChange}
              placeholder="https://images.example.com/cover.jpg"
            />
          </Field>
        </div>
        {formError ? (
          <p className="gt-alert gt-alert-error md:col-span-2 mb-4">{formError}</p>
        ) : null}
        <div className="md:col-span-2">
          <button className="gt-btn gt-btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : submitLabel}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
