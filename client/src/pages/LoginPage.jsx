import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthFormCard, {
  Field,
  buttonClassName,
  inputClassName,
} from "../components/AuthFormCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiError } from "../lib/api.js";
import { fieldError, validateLogin } from "../lib/validation.js";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });
      const next = location.state?.from?.pathname || "/";
      navigate(next, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setErrors({
          email: fieldError(error.details, "email"),
          password: fieldError(error.details, "password"),
        });
      }
      setFormError(error.message || "Unable to log in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormCard
      title="Log in"
      description="Use your GlobeTrotter account to continue."
      footer={
        <p>
          Need an account?{" "}
          <Link className="font-medium text-teal" to="/signup">
            Sign up
          </Link>
          {" · "}
          <Link className="font-medium text-teal" to="/forgot-password">
            Forgot password
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email" error={errors.email}>
          <input
            className={inputClassName}
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={update}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            className={inputClassName}
            type="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={update}
          />
        </Field>
        {formError ? <p className="mb-4 text-sm text-coral">{formError}</p> : null}
        <button className={buttonClassName} type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Log in"}
        </button>
      </form>
    </AuthFormCard>
  );
}
