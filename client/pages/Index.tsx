import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Layers,
  Palette,
  Rocket,
  Shield,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useMemo, type ReactNode } from "react";

type TemplatePreview = { name: string; img: string };

export default function Index() {
  const { t } = useTranslation();

  const previewItems: TemplatePreview[] = useMemo(
    () => [
      { name: "Modern", img: "/template-previews/modern.png" },
      { name: "Fashion", img: "/template-previews/fashion.png" },
      { name: "Electronics", img: "/template-previews/electronics.png" },
      { name: "Beauty", img: "/template-previews/beauty.png" },
      { name: "Furniture", img: "/template-previews/furniture.png" },
      { name: "Food", img: "/template-previews/food.png" },
      { name: "Jewelry", img: "/template-previews/jewelry.png" },
      { name: "Perfume", img: "/template-previews/perfume.png" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="container relative mx-auto px-4 py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900/40 dark:text-gray-200">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>{t("home.new.hero.kicker")}</span>
              </div>

              <h1 className="mt-4 text-4xl font-black leading-[1.07] tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                {t("home.new.hero.title")}
                <span className="block bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  {t("brand")}
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                {t("home.new.hero.subtitle")}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button className="group h-11 bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-cyan-700">
                    {t("home.new.hero.primary")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" className="h-11 px-5 text-sm font-semibold">
                    {t("home.new.hero.secondary")}
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                <ValueCard
                  icon={<BadgeCheck className="h-5 w-5" />}
                  title={t("home.new.hero.trust1.title")}
                  desc={t("home.new.hero.trust1.desc")}
                />
                <ValueCard
                  icon={<Shield className="h-5 w-5" />}
                  title={t("home.new.hero.trust2.title")}
                  desc={t("home.new.hero.trust2.desc")}
                />
                <ValueCard
                  icon={<Bot className="h-5 w-5" />}
                  title={t("home.new.hero.trust3.title")}
                  desc={t("home.new.hero.trust3.desc")}
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-600/10 via-transparent to-cyan-600/10 blur-2xl" />
              <div className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 shadow-2xl backdrop-blur dark:border-gray-800/60 dark:bg-gray-900/40">
                <div className="border-b border-gray-200/60 bg-white/60 px-4 py-3 dark:border-gray-800/60 dark:bg-gray-900/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {t("home.new.hero.previewLabel")}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <img
                    src="/template-previews/pro-landing.svg"
                    alt={t("home.new.hero.previewAlt")}
                    className="block w-full"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-950/80" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat
                  icon={<TrendingUp className="h-4 w-4" />}
                  title={t("home.new.hero.stat1.title")}
                  value={t("home.new.hero.stat1.value")}
                />
                <MiniStat
                  icon={<Store className="h-4 w-4" />}
                  title={t("home.new.hero.stat2.title")}
                  value={t("home.new.hero.stat2.value")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="bg-white py-14 dark:bg-gray-950 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
              {t("home.new.templates.title")}
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
              {t("home.new.templates.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {previewItems.map((p) => (
              <div
                key={p.name}
                className="group overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800/70 dark:bg-gray-900"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("home.new.templates.tag")}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/pricing">
              <Button variant="outline" className="h-11 px-5 text-sm font-semibold">
                {t("home.new.templates.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-14 dark:from-gray-900 dark:to-gray-950 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
              {t("home.new.how.title")}
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
              {t("home.new.how.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <StepCard
              icon={<Palette className="h-5 w-5" />}
              title={t("home.new.how.step1.title")}
              desc={t("home.new.how.step1.desc")}
            />
            <StepCard
              icon={<Layers className="h-5 w-5" />}
              title={t("home.new.how.step2.title")}
              desc={t("home.new.how.step2.desc")}
            />
            <StepCard
              icon={<Rocket className="h-5 w-5" />}
              title={t("home.new.how.step3.title")}
              desc={t("home.new.how.step3.desc")}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-14 dark:bg-gray-950 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
              {t("home.new.features.title")}
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
              {t("home.new.features.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MiniFeature
              icon={<Store className="h-5 w-5" />}
              title={t("home.new.features.item1.title")}
              desc={t("home.new.features.item1.desc")}
            />
            <MiniFeature
              icon={<Bot className="h-5 w-5" />}
              title={t("home.new.features.item2.title")}
              desc={t("home.new.features.item2.desc")}
            />
            <MiniFeature
              icon={<Shield className="h-5 w-5" />}
              title={t("home.new.features.item3.title")}
              desc={t("home.new.features.item3.desc")}
            />
            <MiniFeature
              icon={<TrendingUp className="h-5 w-5" />}
              title={t("home.new.features.item4.title")}
              desc={t("home.new.features.item4.desc")}
            />
            <MiniFeature
              icon={<BadgeCheck className="h-5 w-5" />}
              title={t("home.new.features.item5.title")}
              desc={t("home.new.features.item5.desc")}
            />
            <MiniFeature
              icon={<Rocket className="h-5 w-5" />}
              title={t("home.new.features.item6.title")}
              desc={t("home.new.features.item6.desc")}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-14 dark:from-gray-950 dark:to-gray-900 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
              {t("home.new.faq.title")}
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
              {t("home.new.faq.subtitle")}
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <Accordion type="single" collapsible className="rounded-2xl border border-gray-200/70 bg-white p-2 shadow-sm dark:border-gray-800/70 dark:bg-gray-900">
              {[
                {
                  q: t("home.new.faq.q1"),
                  a: t("home.new.faq.a1"),
                },
                {
                  q: t("home.new.faq.q2"),
                  a: t("home.new.faq.a2"),
                },
                {
                  q: t("home.new.faq.q3"),
                  a: t("home.new.faq.a3"),
                },
                {
                  q: t("home.new.faq.q4"),
                  a: t("home.new.faq.a4"),
                },
                {
                  q: t("home.new.faq.q5"),
                  a: t("home.new.faq.a5"),
                },
              ].map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="rounded-xl border-b border-gray-200/70 px-3 last:border-b-0 dark:border-gray-800/70"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold text-gray-900 dark:text-white">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur sm:p-10">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              {t("home.new.cta.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-white/90 sm:text-lg">
              {t("home.new.cta.subtitle")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/quick-sell">
                <Button className="h-12 bg-white px-6 text-sm font-semibold text-indigo-700 hover:bg-white/90">
                  {t("home.new.cta.primary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="h-12 border-white/70 px-6 text-sm font-semibold text-white hover:bg-white/10">
                  {t("home.new.cta.secondary")}
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-xs text-white/80">{t("home.new.cta.footnote")}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900/40">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
        {icon}
      </div>
      <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{desc}</div>
    </div>
  );
}

function StepCard({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm dark:border-gray-800/70 dark:bg-gray-900">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-lg">
        {icon}
      </div>
      <div className="mt-4 text-lg font-black text-gray-900 dark:text-white">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{desc}</div>
    </div>
  );
}

function MiniFeature({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-200/70 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800/70 dark:bg-gray-900">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/15 to-cyan-600/15 text-indigo-700 dark:from-indigo-500/15 dark:to-cyan-500/15 dark:text-indigo-200">
        {icon}
      </div>
      <div className="mt-4 text-base font-black text-gray-900 dark:text-white">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{desc}</div>
    </div>
  );
}

function MiniStat({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-gray-900/50">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-gray-600 dark:text-gray-300">{title}</div>
        <div className="truncate text-sm font-black text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}
