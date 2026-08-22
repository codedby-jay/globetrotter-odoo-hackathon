const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup({ name, email, password, confirmPassword }) {
  const errors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!trimmedEmail) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address";
  }

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (password.toLowerCase() === trimmedEmail.toLowerCase()) {
    errors.password = "Password cannot be the same as your email";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
}

export function validateForgotPassword({ email }) {
  const errors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address";
  }

  return errors;
}

export function validateResetPassword({ password, confirmPassword }) {
  const errors = {};

  if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function fieldError(details, field) {
  return details?.find((item) => item.field === field)?.message;
}

export function validateStopDates({ startDate, endDate, tripStart, tripEnd }) {
  const errors = {};
  if (!startDate) {
    errors.startDate = "Start date is required";
  }
  if (!endDate) {
    errors.endDate = "End date is required";
  } else if (startDate && endDate < startDate) {
    errors.endDate = "End date cannot be before start date";
  }
  if (startDate && tripStart && startDate < tripStart) {
    errors.startDate = "Stop cannot start before the trip starts";
  }
  if (endDate && tripEnd && endDate > tripEnd) {
    errors.endDate = "Stop cannot end after the trip ends";
  }
  return errors;
}

export function validateTrip({
  name,
  startDate,
  endDate,
  budgetLimit,
  coverPhotoUrl,
}) {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Trip name is required";
  }

  if (!startDate) {
    errors.startDate = "Start date is required";
  }

  if (!endDate) {
    errors.endDate = "End date is required";
  } else if (startDate && endDate < startDate) {
    errors.endDate = "End date cannot be before start date";
  }

  if (budgetLimit !== "" && Number(budgetLimit) < 0) {
    errors.budgetLimit = "Budget cannot be negative";
  }

  if (coverPhotoUrl.trim()) {
    try {
      const parsed = new URL(coverPhotoUrl.trim());
      if (!["http:", "https:"].includes(parsed.protocol)) {
        errors.coverPhotoUrl = "Enter a valid image URL";
      }
    } catch {
      errors.coverPhotoUrl = "Enter a valid image URL";
    }
  }

  return errors;
}

export function validateActivitySchedule({
  scheduledDate,
  startTime,
  endTime,
  cost,
  stopStart,
  stopEnd,
}) {
  const errors = {};
  if (!scheduledDate) {
    errors.scheduledDate = "Date is required";
  } else if (stopStart && scheduledDate < stopStart) {
    errors.scheduledDate = "Date must fall inside the destination dates";
  } else if (stopEnd && scheduledDate > stopEnd) {
    errors.scheduledDate = "Date must fall inside the destination dates";
  }

  if (startTime && endTime && endTime <= startTime) {
    errors.endTime = "End time must be after start time";
  }

  if (cost !== "" && Number(cost) < 0) {
    errors.cost = "Cost cannot be negative";
  }

  return errors;
}
