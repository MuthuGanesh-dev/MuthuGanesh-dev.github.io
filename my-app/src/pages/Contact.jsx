import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with real submit logic (fetch / axios / forms.dev) as needed
    alert(
      `Message sent:\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`
    );
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Contact Us
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Name
            </span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              placeholder="Your name"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Email
            </span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Message
            </span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="6"
              className="mt-1 block w-full rounded-md border px-3 py-2 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              placeholder="Write your message here"
              required
            />
          </label>

          <div className="flex justify-end">
            <Button type="submit">Send message</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
