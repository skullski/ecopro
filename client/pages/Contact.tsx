import React, { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Here you would send the form data to your backend or support system
    setSubmitted(true);
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-extrabold mb-4 text-center bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">Contact Support</h1>
      <p className="text-lg mb-6 text-center text-muted-foreground">
        Need help? Fill out the form below or reach us directly at <a href="mailto:support@walidstore.com" className="text-primary underline">support@walidstore.com</a>.<br />
        <span className="text-sm">Support hours: 9am – 6pm (GMT+1), Mon–Fri. Typical response time: within 24 hours.</span>
      </p>
      <form onSubmit={handleSubmit} className="bg-primary/5 rounded-xl p-6 flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          className="px-4 py-3 rounded-lg border border-primary/20 bg-background/80 focus:border-primary/60 outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
          className="px-4 py-3 rounded-lg border border-primary/20 bg-background/80 focus:border-primary/60 outline-none"
        />
        <textarea
          name="message"
          placeholder="How can we help you?"
          value={form.message}
          onChange={handleChange}
          required
          rows={5}
          className="px-4 py-3 rounded-lg border border-primary/20 bg-background/80 focus:border-primary/60 outline-none"
        />
        <button
          type="submit"
          className="mt-2 py-3 rounded-lg bg-gradient-to-r from-primary via-accent to-purple-600 text-white font-bold shadow-lg hover:from-primary/90 hover:via-accent/90 hover:to-purple-700 transition-all"
        >
          Send Message
        </button>
        {submitted && (
          <div className="text-green-600 font-semibold text-center mt-2">Thank you! Your message has been sent.</div>
        )}
      </form>
      <div className="mt-8 text-center text-muted-foreground text-sm">
        Or call us: <a href="tel:+213555123456" className="text-primary underline">+213 555 123 456</a>
      </div>
    </div>
  );
}
