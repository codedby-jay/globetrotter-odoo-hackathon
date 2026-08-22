import { useState } from "react";
import { Link } from "react-router-dom";
import AuthFormCard, {
  Field,
  buttonClassName,
  inputClassName,
} from "../components/AuthFormCard.jsx";
import { apiRequest, ApiError } from "../lib/api.js";
import { fieldError, validateForgotPassword } from "../lib/validation.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForgotPassword({ email });
    setErrors(nextErrors);
    setFormError("");
    setMessage("");
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email: email.trim() },
      });
      setMessage(data.message);
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        setErrors({ email: fieldError(error.details, "email") });
      }
      setFormError(error.message || "Unable to start password reset");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormCard
      title="Forgot password"
      description="If the email is registered, the backend will log a reset URL for this hackathon."
      footer={
        <p>
          <Link className="font-medium text-teal" to="/login">
            Back to login
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        {formError ? <p className="mb-4 text-sm text-coral">{formError}</p> : null}
        {message ? <p className="mb-4 text-sm text-teal-dark">{message}</p> : null}
        <button className={buttonClassName} type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthFormCard>
  );
}
