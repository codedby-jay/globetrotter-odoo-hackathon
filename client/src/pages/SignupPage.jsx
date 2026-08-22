import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthFormCard, {
  Field,
  buttonClassName,
  inputClassName,
} from "../components/AuthFormCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiError } from "../lib/api.js";
import { fieldError, validateSignup } from "../lib/validation.js";
import { safeNextPath } from "../lib/navigation.js";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"), "/");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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
    const nextErrors = validateSignup(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate(nextPath, { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setErrors({
          name: fieldError(error.details, "name"),
          email: fieldError(error.details, "email"),
          password: fieldError(error.details, "password"),
          confirmPassword: fieldError(error.details, "confirmPassword"),
        });
      }
      setFormError(error.message || "Unable to create account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormCard
      title="Create an account"
      description="Save trips and itineraries to your GlobeTrotter profile."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            className="font-medium text-teal"
            to={`/login${nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          >
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Name" error={errors.name}>
          <input
            className={inputClassName}
            type="text"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={update}
          />
        </Field>
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
        {formError ? <p className="mb-4 text-sm text-coral">{formError}</p> : null}
        <button className={buttonClassName} type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </AuthFormCard>
  );
}
