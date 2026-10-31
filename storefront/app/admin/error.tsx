"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="admin-setup">
      <span className="eyebrow">CONNECTION INTERRUPTED</span>
      <h1>The workspace couldn’t load.</h1>
      <p>
        Your saved content is still in the database. Check that setup migrations
        have completed and try again.
      </p>
      <button className="admin-primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
