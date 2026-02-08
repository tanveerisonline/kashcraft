"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

interface NewsletterSignupProps {
  onSuccess?: () => void;
}

export function NewsletterSignup({ onSuccess }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/marketing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Successfully subscribed!" });
        setEmail("");
        setFirstName("");
        setLastName("");
        onSuccess?.();
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: "error", text: data.error || "Subscription failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="from-primary to-primary-focus rounded-lg bg-gradient-to-r py-12">
      <div className="mx-auto max-w-md px-4">
        <div className="mb-6 text-center text-white">
          <h2 className="mb-2 text-3xl font-bold">Stay Updated</h2>
          <p>Get exclusive deals and product updates delivered to your inbox</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="First Name (optional)"
            className="input input-bordered w-full bg-white"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name (optional)"
            className="input input-bordered w-full bg-white"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <div className="join w-full">
            <input
              type="email"
              placeholder="your@email.com"
              className="join-item input input-bordered flex-1 bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="join-item btn btn-accent" disabled={loading}>
              {loading ? "Subscribing..." : <Mail size={18} />}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-3 text-center text-sm ${message.type === "success" ? "text-success" : "text-error"}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
