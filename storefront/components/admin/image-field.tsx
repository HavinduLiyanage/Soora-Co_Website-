"use client";
import { useState } from "react";
import { Upload, Images } from "lucide-react";
type Media = { id: string; url: string; name: string };
export default function ImageField({
  value,
  onChange,
  demo,
  label = "Image",
}: {
  value: string;
  onChange: (v: string) => void;
  demo: boolean;
  label?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [library, setLibrary] = useState<Media[] | null>(null);
  return (
    <div className="admin-image-field">
      <span className="admin-field-label">{label}</span>
      <div className="admin-image-controls">
        <img src={value || "/images/hero.png"} alt="Selected artwork" />
        <div>
          <label className="admin-secondary upload-label">
            <Upload size={16} />
            {busy ? "Uploading…" : "Upload image"}
            <input
              aria-label={"Upload " + label.toLowerCase()}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={demo || busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setBusy(true);
                setError("");
                try {
                  const data = new FormData();
                  data.set("file", file);
                  const r = await fetch("/api/admin/media/", {
                    method: "POST",
                    body: data,
                  });
                  const result = await r.json();
                  if (!r.ok) throw new Error(result.error);
                  onChange(result.url);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Upload failed.");
                } finally {
                  setBusy(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
          <button
            type="button"
            className="admin-text-link"
            disabled={demo}
            onClick={async () => {
              setError("");
              try {
                const r = await fetch("/api/admin/media/");
                const data = await r.json();
                if (!r.ok) throw new Error(data.error);
                setLibrary(data);
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Library unavailable.",
                );
              }
            }}
          >
            <Images size={15} />
            Choose from library
          </button>
          <small>
            JPG, PNG or WebP · Up to 3 MB
            <br />
            Uploads are stored immediately; publish to display them.
          </small>
        </div>
      </div>
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
      {library && (
        <div className="admin-media-library">
          {library.length === 0 ? (
            <p>No uploads yet.</p>
          ) : (
            library.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => {
                  onChange(m.url);
                  setLibrary(null);
                }}
              >
                <img src={m.url} alt={m.name} />
                <span>{m.name}</span>
              </button>
            ))
          )}
          <button type="button" onClick={() => setLibrary(null)}>
            Close library
          </button>
        </div>
      )}
    </div>
  );
}
