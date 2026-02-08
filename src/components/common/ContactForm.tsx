"use client";

import { Mail, Phone, MapPin } from "lucide-react";

export function ContactForm() {
  return (
    <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Contact Us</h2>
        <p className="text-gray-600">Have a question? We'd love to hear from you.</p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail size={24} className="text-primary" />
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-gray-600">support@kashcraft.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={24} className="text-primary" />
            <div>
              <p className="font-semibold">Phone</p>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={24} className="text-primary" />
            <div>
              <p className="font-semibold">Address</p>
              <p className="text-gray-600">123 Main St, City, State 12345</p>
            </div>
          </div>
        </div>
      </div>

      <form className="space-y-4">
        <input type="text" placeholder="Your Name" className="input input-bordered w-full" />
        <input type="email" placeholder="Your Email" className="input input-bordered w-full" />
        <textarea placeholder="Message" className="textarea textarea-bordered h-24 w-full" />
        <button type="submit" className="btn btn-primary w-full">
          Send Message
        </button>
      </form>
    </div>
  );
}
