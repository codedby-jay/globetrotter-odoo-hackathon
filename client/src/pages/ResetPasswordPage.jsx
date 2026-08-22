import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormCard, {
  Field,
  buttonClassName,
  inputClassName,
} from "../components/AuthFormCard.jsx";
import { apiRequest, ApiError } from "../lib/api.js";
import { fieldError, validateResetPassword } from "../lib/validation.js";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const nextErrors = validateResetPassword(form);
    if (!token) {
      nextErrors.token = "Reset token is missing";
    }
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: {
          token,
          password: form.password,
        },
      });
      navigate("/login", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setErrors({
          password: fieldError(error.details, "password"),
          token: fieldError(error.details, "token"),
        });
      }
      setFormError(error.message || "Unable to reset password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormCard
      title="Reset password"
      description="Choose a new password for your account."
      footer={
        <p>
          <Link className="font-medium text-teal" to="/login">
            Back to login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field label="New password" error={errors.password}>
          <input
            className={inputClassName}
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update}
          />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword}>
          <input
            className={inputClassName}
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={update}
          />
        </Field>
        {errors.token ? <p className="mb-4 text-sm text-coral">{errors.token}</p> : null}
        {formError ? <p className="mb-4 text-sm text-coral">{formError}</p> : null}
        <button className={buttonClassName} type="submit" disabled={submitting}>
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthFormCard>
  );
}
