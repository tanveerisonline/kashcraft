"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <section className="from-primary to-secondary bg-gradient-to-r py-20 text-white">
        <div className="container-custom">
          <h1 className="mb-4 text-5xl font-bold">Contact Us</h1>
          <p className="text-lg opacity-90">We'd love to hear from you</p>
        </div>
      </section>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Contact Form */}
          <div>
            <h2 className="mb-6 text-3xl font-bold">Get in Touch</h2>

            {submitted && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                ✓ Thank you! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Message</label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="focus:ring-primary w-full resize-none rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
                  placeholder="Your message..."
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="mb-6 text-3xl font-bold">Contact Information</h2>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-2 text-lg font-bold">📍 Address</h3>
                <p className="text-gray-700">
                  123 Kashmiri Street
                  <br />
                  Srinagar, Kashmir 190001
                  <br />
                  India
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2 text-lg font-bold">📧 Email</h3>
                <p className="text-gray-700">
                  <a href="mailto:hello@kashcraft.com" className="text-primary hover:underline">
                    hello@kashcraft.com
                  </a>
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2 text-lg font-bold">📞 Phone</h3>
                <p className="text-gray-700">
                  <a href="tel:+919876543210" className="text-primary hover:underline">
                    +91 9876 543 210
                  </a>
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2 text-lg font-bold">⏰ Business Hours</h3>
                <p className="text-gray-700">
                  Monday - Friday: 9:00 AM - 6:00 PM
                  <br />
                  Saturday: 10:00 AM - 4:00 PM
                  <br />
                  Sunday: Closed
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
