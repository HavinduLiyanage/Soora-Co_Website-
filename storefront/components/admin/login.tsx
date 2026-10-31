"use client";
import { useState } from "react";
import Link from "next/link";
export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="admin-login">
      <span className="admin-wordmark">
        SOORA <span>& CO.</span>
      </span>
      <span className="eyebrow">WELCOME BACK</span>
      <h1>
        Your store.
        <br />
        At a glance.
      </h1>
      <p>Sign in to manage the collection.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const f = new FormData(e.currentTarget);
          try {
            const r = await fetch("/api/auth/sign-in/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: f.get("email"),
                password: f.get("password"),
                rememberMe: false,
              }),
            });
            if (!r.ok)
              throw new Error(
                r.status === 429
                  ? "Too many attempts. Wait a minute and try again."
                  : "Unable to sign in. Check your email and password.",
              );
            window.location.assign("/admin/");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={12}
          />
        </label>
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        <button disabled={busy} className="admin-primary">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="admin-note">
        Owner accounts are created privately. For account recovery, contact the
        person managing this website.
      </p>
      <Link href="/">Return to the storefront ↗</Link>
    </main>
  );
}
