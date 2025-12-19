
import { useState } from "react";
import { Mail, Phone, Clock, Send, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function Contact() {

  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
    setForm({ name: "", email: "", message: "" });
    // Reset success message after 5s
    setTimeout(() => setSubmitted(false), 5000);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS0yIDJoLTJ2Mmgydi0yek0zMiAzOGgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yek0yOCAzNGgtMnYyaDJ2LTJ6bS02IDB2LTJoLTJ2Mmgyem0tMiAydi0ySDR2Mmgyem0tMiAydi0ySDR2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-6xl">
          {/* Hero Content */}
          <div className="text-center mb-6 md:mb-4 md:mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg mb-4">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium">{t('contact.badge') || "We're here to help"}</span>
            </div>
            
            <h1 className="text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl lg:text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl xl:text-6xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                {t('contact.title') || 'Get in Touch'}
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('contact.subtitle') || 'Have questions? Need help? Our support team is ready to assist you.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-4 md:mb-6">
            {/* Contact Info Cards */}
            {[
              {
                icon: Mail,
                title: t('contact.card.email.title') || 'Email Us',
                content: t('contact.card.email.content') || 'support@walidstore.com',
                description: t('contact.card.email.desc') || "We'll respond within 24 hours"
              },
              {
                icon: Phone,
                title: t('contact.card.phone.title') || 'Call Us',
                content: t('contact.card.phone.content') || '+213 555 123 456',
                description: t('contact.card.phone.desc') || 'Mon-Fri, 9AM - 6PM GMT+1'
              },
              {
                icon: Clock,
                title: t('contact.card.time.title') || 'Response Time',
                content: t('contact.card.time.content') || '< 24 hours',
                description: t('contact.card.time.desc') || 'Typical response time'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold mb-1">{item.title}</h3>
                <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{item.content}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 md:p-4 border border-indigo-100 dark:border-indigo-900">
              <h2 className="text-2xl md:text-xl md:text-2xl font-bold mb-6 text-center">{t('contact.form.title') || 'Send us a Message'}</h2>
              
              {submitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-green-700 dark:text-green-300 font-semibold">
                    {t('contact.form.success') || 'Thank you! Your message has been sent successfully.'}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.name') || 'Your Name'}</label>
                  <input
                    type="text"
                    name="name"
                    placeholder={t('contact.form.namePlaceholder')}
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.email') || 'Email Address'}</label>
                  <input
                    type="email"
                    name="email"
                    placeholder={t('contact.form.emailPlaceholder')}
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form.message') || 'Your Message'}</label>
                  <textarea
                    name="message"
                    placeholder={t('contact.form.messagePlaceholder')}
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none transition-colors resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-xl h-14 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t('contact.form.sending') || 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('contact.form.submit') || 'Send Message'}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 md:mt-4 md:mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{t('contact.location.label') || 'Location:'}</span> {t('contact.location.value') || 'Algeria'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
