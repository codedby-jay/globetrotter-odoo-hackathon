import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormCard, {
  Field,
  buttonClassName,
  inputClassName,
} from "../components/AuthFormCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiError, explainApiError } from "../lib/api.js";
import { fieldError, validateLogin } from "../lib/validation.js";
import { safeNextPath } from "../lib/navigation.js";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(
    searchParams.get("next") || location.state?.from?.pathname,
    "/",
  );
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiDown, setApiDown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((response) => {
        if (!cancelled) {
          setApiDown(!response.ok);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApiDown(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) {
      return;
    }
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
      navigate(nextPath, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setErrors({
          email: fieldError(error.details, "email"),
          password: fieldError(error.details, "password"),
        });
      }
      setFormError(explainApiError(error, "Unable to log in"));
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
          <Link className="font-medium text-teal" to={`/signup${nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>
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
        {apiDown ? (
          <p className="mb-4 rounded-xl border border-coral/30 bg-[rgba(212,90,60,0.08)] px-3 py-2 text-sm text-coral">
            The API is not running. In a second terminal run{" "}
            <code className="font-semibold">cd server && npm run dev</code>, then try again.
          </p>
        ) : null}
        {formError ? <p className="mb-4 text-sm text-coral">{formError}</p> : null}
        <button className={buttonClassName} type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Log in"}
        </button>
      </form>
    </AuthFormCard>
  );
}
